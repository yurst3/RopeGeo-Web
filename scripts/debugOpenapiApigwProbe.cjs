/**
 * Debug probe: verify bundled+resolved OpenAPI contains fields HTTP API import needs for Lambda integration.
 * Writes NDJSON to RopeGeo .cursor debug log (session f50013). Run after build:openapi + resolveYamlEnvs.
 *
 *   node scripts/debugOpenapiApigwProbe.cjs docs-build/openapiResolved.yaml
 */
const fs = require('fs');
const path = require('path');

const LOG = '/Users/ethanhurst/CodeProjects/RopeGeo/.cursor/debug-f50013.log';
const specPath = path.resolve(process.cwd(), process.argv[2] || 'docs-build/openapiResolved.yaml');

function logLine(payload) {
  const line = JSON.stringify({
    sessionId: 'f50013',
    timestamp: Date.now(),
    ...payload,
  });
  try {
    fs.appendFileSync(LOG, `${line}\n`);
  } catch {
    // CI or missing .cursor — ignore
  }
}

let text = '';
try {
  text = fs.readFileSync(specPath, 'utf8');
} catch (e) {
  logLine({
    hypothesisId: 'H0',
    location: 'debugOpenapiApigwProbe.cjs',
    message: 'spec file missing',
    data: { specPath, err: String(e) },
  });
  process.exit(1);
}

const hasIntegration = /x-amazon-apigateway-integration\s*:/.test(text);
const hasPayload = /payloadFormatVersion\s*:\s*["']?1\.0["']?/.test(text);
const hasExplorePath = /\/explore\/\{id\}\/page\s*:/.test(text);
const hasUri = /arn:aws:apigateway:[^:]+:lambda:path\/2015-03-31\/functions\/arn:aws:lambda:/.test(
  text.replace(/\s+/g, ' '),
);

logLine({
  hypothesisId: 'H1',
  location: 'debugOpenapiApigwProbe.cjs',
  message: 'resolved spec shape',
  data: { specPath, hasExplorePath, hasIntegration, hasPayload, hasUri },
});

logLine({
  hypothesisId: 'H2',
  location: 'debugOpenapiApigwProbe.cjs',
  message: 'H2 CloudFormation BodyS3Location does not re-import when only S3 bytes change — fix is apigatewayv2 reimport-api in pipeline (compare WebScraper workflow)',
  data: { note: 'static workflow diff; no local AWS call' },
});

process.exit(0);
