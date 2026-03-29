# RopeGeo-Web — manual setup and operations

This guide walks through what **you** configure outside the repo (DNS, certificates, GitHub, AWS accounts) and how it lines up with the **web_infra_and_page_sharing** plan and the `.github/workflows/pipeline.yaml` pipeline.

## 1. Prerequisites from the plan

1. **ropegeo-common** — `LinkPreview` / `LinkPreviewImage` published (already used by WebScraper and this Lambda).
2. **WebScraper** — `GET /ropewiki/page/{id}/link-preview` deployed and publicly reachable over HTTPS at the base URL you will pass into RopeGeo-Web (default assumed: `https://api.webscraper.ropegeo.com`).
3. **RopeGeo-Web** — this repo; pipeline assumes **`master`** branch (change the workflow if you use `main`).

## 2. GitHub repository secrets

Create these **Actions secrets** (names match `pipeline.yaml`; adjust the workflow if you rename them).

| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | Long-lived key or automation user used **only** to call `sts:AssumeRole` into the pipeline role (same pattern as WebScraper). |
| `AWS_SECRET_ACCESS_KEY` | Companion to the above. |
| `PROD_PIPELINE_EXECUTION_ROLE` | **ARN** of the IAM role GitHub assumes for deploy/sync/S3/CloudFormation (must trust GitHub OIDC or your identity provider; needs permissions below). |
| `PROD_CLOUDFORMATION_EXECUTION_ROLE` | **ARN** of the role passed to `sam deploy --role-arn` / CloudFormation service role (if you use that pattern). |
| `PROD_ARTIFACTS_BUCKET` | S3 bucket name for SAM packaging artifacts and the **main stack template** object used in the “update main with CloudFront ARNs” step. |
| `WEBSCRAPER_API_BASE_URL` | Optional. Base URL for WebScraper **without** trailing slash. If unset, the workflow defaults to `https://api.webscraper.ropegeo.com`. |
| `LANDING_CUSTOM_DOMAIN` | Optional. e.g. `ropegeo.com` — leave **empty** until ACM + DNS are ready; CloudFront will use the default `*.cloudfront.net` hostname. |
| `MOBILE_CUSTOM_DOMAIN` | Optional. e.g. `mobile.ropegeo.com`. |
| `ROPEGEO_WEB_ACM_CERTIFICATE_ARN` | **ACM certificate ARN in `us-east-1`** covering the custom hostnames above (SANs or wildcard). Required **only if** you set custom domains. |

### IAM capabilities the pipeline role needs (summary)

- **CloudFormation**: create/update stacks for `Web-Prod` and `Web-Api-Prod`.
- **S3**: `PutObject`/`GetObject`/`ListBucket`/`DeleteObject` on the **docs**, **landing**, **mobile**, and **artifacts** buckets created or referenced by the stacks.
- **Lambda / IAM**: as required by SAM for the explore Lambda and roles.
- **API Gateway v2**: create/update HTTP API from S3 OpenAPI.
- **CloudFront**: create distributions, invalidations.
- **STS**: `AssumeRole` only if your layout uses a second role for CloudFormation execution.

Tighten policies to your account IDs and bucket ARNs after the first deploy.

## 3. Stack names and regions

Defaults in the workflow (override by editing the workflow env):

- **Main**: `Web-Prod` — S3 (landing, mobile well-known, docs), explore Lambda, IAM.
- **API**: `Web-Api-Prod` — HTTP API + **two** CloudFront distributions (landing + mobile).
- **Region**: `us-east-1` (required for CloudFront + ACM).

## 4. Deploy order (automated pipeline)

The pipeline implements the same **two-step** pattern as WebScraper:

1. **Deploy main** — `sam deploy` packaged main template (Lambda + buckets). Parameters include **empty** `LandingCloudFrontDistributionArn` and `MobileCloudFrontDistributionArn` on the first run so S3 policies can still allow the **Lambda** to read the landing bucket; mobile bucket policy for CloudFront is created only once the mobile distribution ARN is known.
2. **Build + sync** — `npm run build:landing` (Expo export to repo-root `dist/`), then `aws s3 sync dist/` → landing bucket and `src/site/mobile-well-known/` → mobile bucket.
3. **Upload API docs** — Bundle OpenAPI, substitute `$env-*` placeholders (`REGION`, `EXPLORE_PAGE_LAMBDA_ARN`, `APIGATEWAY_INVOKE_LAMBDA_ROLE_ARN`), upload `docs-build/*` to the **docs** bucket (including `openapiResolved.yaml`).
4. **Deploy API stack** — `aws cloudformation deploy` merged API template: API Gateway imports OpenAPI from S3; CloudFront distributions point at landing S3, mobile S3, and `execute-api`.
5. **Update main stack** — Copies the **current** main template from CloudFormation to S3, then `update-stack` with **only** parameter changes: set `LandingCloudFrontDistributionArn` and `MobileCloudFrontDistributionArn` from the API stack outputs so **OAC** can read the correct buckets.
6. **Invalidate CloudFront** — `/*` on both distributions.

If step 5 reports “No updates are to be performed”, the ARNs already match; the job exits successfully.

## 5. ACM and Route 53 (manual)

1. In **ACM (us-east-1)**, request or import a certificate that includes **`ropegeo.com`**, **`mobile.ropegeo.com`**, or a suitable wildcard (e.g. `*.ropegeo.com` + apex, per your DNS strategy).
2. Complete **DNS validation** (CNAME records in Route 53 or your DNS host).
3. Put the certificate **ARN** in `ROPEGEO_WEB_ACM_CERTIFICATE_ARN`.
4. Create **Route 53 alias A/AAAA** (or equivalent) records:
   - **Landing** distribution → apex (or `www`, per your choice).
   - **Mobile** distribution → `mobile.ropegeo.com`.
5. Set `LANDING_CUSTOM_DOMAIN` and `MOBILE_CUSTOM_DOMAIN` to match; re-run or push to **master** to redeploy the API stack with aliases + TLS.

Until this is done, leave custom domain secrets **empty** and use CloudFront default domain names for smoke tests.

## 6. Bucket policy note (plan checklist)

The **landing** bucket must allow:

- **`s3:GetObject`** for the **explore Lambda** role (declared in the main template).
- **`s3:GetObject`** for **CloudFront OAC** once the landing distribution ARN is set on the main stack.

The pipeline’s **update main** step exists specifically so OAC statements reference the real distribution ARNs after the API stack exists.

## 7. AASA and Digital Asset Links

1. Edit **`src/site/mobile-well-known/.well-known/apple-app-site-association`** — replace `YOUR_APPLE_TEAM_ID` and bundle id; keep paths aligned with **`/explore/*`** and your iOS `associatedDomains`.
2. Edit **`src/site/mobile-well-known/.well-known/assetlinks.json`** — package name and **release** SHA-256 fingerprint.
3. After deploy, validate with Apple’s / Google’s tools (as noted in the plan).

**Content-Type**: When syncing, if a validator complains, you may need to set `Content-Type` on specific keys (e.g. `application/json` for AASA). The default `aws s3 sync` may use `application/octet-stream`; use `aws s3 cp` with `--content-type` for those objects if required.

## 8. Landing build (Expo)

The landing UI lives under **`src/site/landing/`** (`App.tsx`, `index.ts`, `assets/`). There is **one** `package.json` at the Web repo root (Expo + Lambda/tooling deps together).

1. **Local:** From repo root, `npm ci` then `npm run build:landing` (runs `ensureLandingAssets.cjs`, `expo export --platform web`, `injectLinkPreviewPlaceholder.cjs`). Static output is repo-root **`dist/`** (not under `src/site/landing/`).
2. **Open Graph placeholder:** Keep the injection step unless you maintain `<!-- LINK_PREVIEW_HEAD -->` in the exported `index.html` yourself.
3. **CI:** Root `npm ci` and `npm run build:landing`, then `aws s3 sync dist/` to the landing bucket.

## 9. Operational risks (from the plan)

- **Latency** — Lambda does S3 + WebScraper **sequentially**; add provisioned concurrency on `ExplorePage` if needed.
- **HTML escaping** — Meta `content` attributes are escaped in code; keep using `LinkPreview` from JSON only.
- **Caching** — `/explore/*` uses a **caching-disabled** cache policy in CloudFront; revisit if you change behavior.
- **Stale shell** — Changing only `index.html` in S3 still works with injection; run invalidations (pipeline does this after updates).

## 10. Changing stack or branch names

Edit the `env` block at the top of `.github/workflows/pipeline.yaml` (`PROD_MAIN_STACK_NAME`, `PROD_API_STACK_NAME`, `PROD_REGION`, branch under `on.push`).
