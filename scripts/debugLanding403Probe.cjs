/**
 * Gathers AWS runtime evidence for CloudFront→S3 landing 403 (OAC / bucket policy).
 * Run with credentials that can read CFN, S3, CloudFront (e.g. aws sso login / profile).
 *
 *   MAIN_STACK=Web-Prod API_STACK=Web-Api-Prod REGION=us-east-1 node scripts/debugLanding403Probe.cjs
 */
// #region agent log
const fs = require('fs');
const { execSync } = require('child_process');

const LOG_PATH = '/Users/ethanhurst/CodeProjects/RopeGeo/.cursor/debug-f50013.log';
const SESSION = 'f50013';

function emit(payload) {
    const line = JSON.stringify({
        sessionId: SESSION,
        runId: process.env.AGENT_DEBUG_RUN_ID || 'pre-fix',
        timestamp: Date.now(),
        ...payload,
    });
    try {
        fs.mkdirSync(require('path').dirname(LOG_PATH), { recursive: true });
        fs.appendFileSync(LOG_PATH, line + '\n');
    } catch (_) {}
}

function awsJson(args) {
    try {
        const out = execSync(`aws ${args} --output json`, {
            encoding: 'utf8',
            maxBuffer: 20 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        return { ok: true, data: JSON.parse(out) };
    } catch (e) {
        const stderr = e.stderr ? e.stderr.toString() : '';
        return { ok: false, err: stderr || e.message || String(e) };
    }
}

function awsText(args) {
    try {
        const out = execSync(`aws ${args} --output text`, {
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        return { ok: true, out: out.trim() };
    } catch (e) {
        const stderr = e.stderr ? e.stderr.toString() : '';
        return { ok: false, err: stderr || e.message || String(e) };
    }
}

const MAIN_STACK = process.env.MAIN_STACK || 'Web-Prod';
const API_STACK = process.env.API_STACK || 'Web-Api-Prod';
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';

emit({
    hypothesisId: 'H0',
    location: 'debugLanding403Probe.cjs:start',
    message: 'probe start',
    data: { MAIN_STACK, API_STACK, REGION },
});

// H1: Main stack parameter LandingCloudFrontDistributionArn wrong / empty
const mainParams = awsJson(
    `cloudformation describe-stacks --stack-name ${MAIN_STACK} --region ${REGION}`,
);
if (!mainParams.ok) {
    emit({
        hypothesisId: 'H1',
        location: 'debugLanding403Probe.cjs:describe-main',
        message: 'describe main stack failed',
        data: { err: mainParams.err },
    });
} else {
    const params = mainParams.data.Stacks[0].Parameters || [];
    const landingArnParam = params.find((p) => p.ParameterKey === 'LandingCloudFrontDistributionArn');
    emit({
        hypothesisId: 'H1',
        location: 'debugLanding403Probe.cjs:main-params',
        message: 'LandingCloudFrontDistributionArn parameter',
        data: {
            value: landingArnParam ? landingArnParam.ParameterValue : null,
        },
    });
}

const apiStackRes = awsJson(
    `cloudformation describe-stacks --stack-name ${API_STACK} --region ${REGION}`,
);

// H2: API stack output ARN
let landingOutputArn = null;
if (apiStackRes.ok) {
    const outs = apiStackRes.data.Stacks[0].Outputs || [];
    const lo = outs.find((o) => o.OutputKey === 'LandingCloudFrontDistributionArn');
    landingOutputArn = lo ? lo.OutputValue : null;
}
emit({
    hypothesisId: 'H2',
    location: 'debugLanding403Probe.cjs:api-output-landing-arn',
    message: 'API stack LandingCloudFrontDistributionArn output',
    data: apiStackRes.ok ? { output: landingOutputArn } : { err: apiStackRes.err },
});

// H3: Bucket policy — aws:SourceArn vs AWS:SourceArn and value
const bucketOut = awsText(
    `cloudformation describe-stacks --stack-name ${MAIN_STACK} --region ${REGION} --query "Stacks[0].Outputs[?OutputKey=='LandingSiteBucketName'].OutputValue"`,
);
let policyAnalysis = { skipped: 'no bucket name' };
if (bucketOut.ok && bucketOut.out && bucketOut.out !== 'None') {
    const bucket = bucketOut.out.trim();
    const pol = awsJson(`s3api get-bucket-policy --bucket ${bucket} --region ${REGION}`);
    if (!pol.ok) {
        policyAnalysis = { err: pol.err };
    } else {
        const doc = JSON.parse(pol.data.Policy);
        const stmts = Array.isArray(doc.Statement) ? doc.Statement : [doc.Statement];
        const oacStmt = stmts.find(
            (s) =>
                s.Sid === 'AllowLandingCloudFrontOAC' ||
                (s.Principal && s.Principal.Service === 'cloudfront.amazonaws.com'),
        );
        const condKeys =
            oacStmt && oacStmt.Condition && oacStmt.Condition.StringEquals
                ? Object.keys(oacStmt.Condition.StringEquals)
                : [];
        const condVals =
            oacStmt && oacStmt.Condition && oacStmt.Condition.StringEquals
                ? oacStmt.Condition.StringEquals
                : {};
        policyAnalysis = {
            bucket,
            hasOacStatement: !!oacStmt,
            conditionKeys: condKeys,
            hasLowercaseAwsSourceArn: condKeys.includes('aws:SourceArn'),
            hasUppercaseAwsSourceArn: condKeys.includes('AWS:SourceArn'),
            sourceArnValue:
                condVals['aws:SourceArn'] || condVals['AWS:SourceArn'] || null,
        };
    }
}
emit({
    hypothesisId: 'H3',
    location: 'debugLanding403Probe.cjs:bucket-policy',
    message: 'landing bucket policy OAC statement shape',
    data: policyAnalysis,
});

// H4: index.html exists at bucket root
if (bucketOut.ok && bucketOut.out && bucketOut.out !== 'None') {
    const bucket = bucketOut.out.trim();
    const head = awsJson(`s3api head-object --bucket ${bucket} --key index.html --region ${REGION}`);
    emit({
        hypothesisId: 'H4',
        location: 'debugLanding403Probe.cjs:index-head',
        message: 'index.html head-object',
        data: head.ok
            ? { exists: true, contentLength: head.data.ContentLength }
            : { exists: false, err: head.err },
    });
}

// H5 + H6: Origin/OAC + custom domain (Aliases) — requests to ropegeo.com 403 if Host not listed as Alias
const distId = awsText(
    `cloudformation describe-stacks --stack-name ${API_STACK} --region ${REGION} --query "Stacks[0].Outputs[?OutputKey=='LandingCloudFrontDistributionId'].OutputValue"`,
);
let originAnalysis = { skipped: true };
const h6 = {
    apiStackDescribeOk: apiStackRes.ok,
    landingCustomDomainParam: '',
    acmCertificateArnParamPresent: false,
    aliasesOnDistribution: [],
    aliasCount: 0,
    cloudFrontDefaultCertificate: null,
    distributionAcmCertificateArn: null,
};

if (apiStackRes.ok) {
    const pars = apiStackRes.data.Stacks[0].Parameters || [];
    const ld = pars.find((p) => p.ParameterKey === 'LandingCustomDomain');
    const acm = pars.find((p) => p.ParameterKey === 'AcmCertificateArn');
    h6.landingCustomDomainParam = ld && ld.ParameterValue ? ld.ParameterValue : '';
    h6.acmCertificateArnParamPresent = !!(
        acm &&
        acm.ParameterValue &&
        String(acm.ParameterValue).trim() !== ''
    );
}

if (distId.ok && distId.out && distId.out !== 'None') {
    const id = distId.out.trim();
    const cfg = awsJson(`cloudfront get-distribution-config --id ${id}`);
    if (cfg.ok) {
        const dc = cfg.data.DistributionConfig;
        const origins = dc.Origins.Items || [];
        const landing = origins[0];
        originAnalysis = {
            distributionId: id,
            firstOriginId: landing ? landing.Id : null,
            domainName: landing ? landing.DomainName : null,
            hasOac: !!(landing && landing.OriginAccessControlId),
            oacId: landing ? landing.OriginAccessControlId : null,
        };
        h6.aliasesOnDistribution = dc.Aliases && dc.Aliases.Items ? dc.Aliases.Items : [];
        h6.aliasCount = dc.Aliases && dc.Aliases.Quantity != null ? dc.Aliases.Quantity : h6.aliasesOnDistribution.length;
        h6.cloudFrontDefaultCertificate = !!dc.ViewerCertificate.CloudFrontDefaultCertificate;
        h6.distributionAcmCertificateArn = dc.ViewerCertificate.ACMCertificateArn || null;
    } else {
        originAnalysis = { distributionId: id, err: cfg.err };
    }
} else {
    originAnalysis = { err: distId.err || 'no distribution id' };
}

emit({
    hypothesisId: 'H5',
    location: 'debugLanding403Probe.cjs:cf-origin',
    message: 'landing CloudFront origin + OAC',
    data: originAnalysis,
});

h6.diagnosisIfBrowsingCustomDomainWhileAliasesEmpty =
    h6.aliasCount === 0
        ? 'Use https://<distribution>.cloudfront.net OR set GitHub secrets LANDING_CUSTOM_DOMAIN + ROPEGEO_WEB_ACM_CERTIFICATE_ARN and redeploy Web-Api-Prod so Aliases includes your domain.'
        : 'Aliases present; if 403 persists check DNS targets this distribution and HTTPS SNI.';

emit({
    hypothesisId: 'H6',
    location: 'debugLanding403Probe.cjs:custom-domain-aliases',
    message: 'API stack domain/cert params vs CloudFront Aliases (403 if Host header not in Aliases)',
    data: h6,
});

emit({
    hypothesisId: 'H0',
    location: 'debugLanding403Probe.cjs:end',
    message: 'probe end',
    data: {},
});
// #endregion agent log

console.log('Wrote probe results to', LOG_PATH);
