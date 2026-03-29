# RopeGeo-Web

This repository hosts **public web infrastructure** for RopeGeo: the **marketing / landing** experience on the apex domain (`ropegeo.com`) and **mobile deep linking** on `mobile.ropegeo.com`.

## What lives here

- **Landing (`ropegeo.com`)** — **Expo** + **React Native for Web**; UI source under **`src/site/landing/`** (`App.tsx`, `index.ts`, `assets/`). **`npm run build:landing`** exports static HTML/JS/CSS to repo-root **`dist/`** and runs **`scripts/injectLinkPreviewPlaceholder.cjs`** so **`<!-- LINK_PREVIEW_HEAD -->`** exists in `<head>` for the explore Lambda’s Open Graph injection.
- **Mobile host (`mobile.ropegeo.com`)** — **CloudFront** with two kinds of traffic:
  - **`/.well-known/*`** — Served from a dedicated **S3** bucket (Apple App Site Association, Digital Asset Links, etc.).
  - **`/explore/*`** — **API Gateway HTTP API** (OpenAPI-defined) → **Lambda** (`getExplorePage`) that loads `index.html` from the **landing** bucket, calls **WebScraper** `GET /ropewiki/page/{id}/link-preview`, injects `<meta property="og:*">` (and basic Twitter tags when an image exists), and returns **200** `text/html` (no redirect for normal deep links).

Together with the **Mobile** app (universal links / App Links) and **WebScraper** JSON, this gives crawlers and messengers a single HTML response with correct preview metadata for links like:

`https://mobile.ropegeo.com/explore/{uuid}/page?source=ropewiki&routeType=...`

## Repo layout

| Path | Purpose |
|------|---------|
| `src/site/landing/` | Expo/React Native landing UI (`App.tsx`, `index.ts`, `assets/`). |
| `src/site/mobile-well-known/` | Files synced to the **mobile** S3 bucket root; includes `.well-known/` for AASA and `assetlinks.json`. |
| `src/api/getExplorePage/` | Explore page Lambda (S3 + `fetch` to WebScraper). |
| `openapi-docs/` | OpenAPI 3.0.1 spec (paths, components, examples, integrations) for the HTTP API. |
| `cloudformation/stacks/main/` | **SAM** main stack: buckets, docs bucket, Lambda, IAM. |
| `cloudformation/stacks/api/` | **CloudFront** (landing + mobile) + **API Gateway** importing `openapiResolved.yaml` from the docs bucket. |
| `scripts/` | `mergeTemplate.ts`, `resolveYamlEnvs.ts`, `ensureLandingAssets.cjs`, `injectLinkPreviewPlaceholder.cjs`. |
| `.github/workflows/pipeline.yaml` | CI: test → package/deploy **main** → sync S3 → upload OpenAPI → deploy **api** → update main stack with CloudFront ARNs → invalidate. |

Merged templates `mergedMainTemplate.yaml` / `mergedApiTemplate.yaml` are **generated** (gitignored); CI always merges before validate/deploy.

## Conventions

When changing infrastructure or API docs, follow the same Cursor rules as **WebScraper** (see `.cursor/rules/`): split CloudFormation under `cloudformation/stacks/**`, long-form intrinsic functions only, OpenAPI under `openapi-docs/` with Redocly + Spectral, and **two-step deploy**: main stack (Lambda + buckets) first, then upload resolved OpenAPI to the docs bucket, then API + CloudFront stack.

## Quick local commands

After pulling changes that touch **`package.json`**, run **`npm install`** once and commit the updated **`package-lock.json`** so CI (`npm ci`) stays green.

```bash
npm ci
npm run lint:main-template
npm run lint:api-template
npm run lint:openapi
npm run typecheck
npm run test:unit
```

**Landing (local):**

```bash
npm ci
npm run web                 # dev server (Expo web)
npm run build:landing       # static export → dist/
```

## Manual setup and operations

See **[docs/MANUAL_STEPS.md](docs/MANUAL_STEPS.md)** for GitHub secrets, ACM/Route 53, first-time deploy order, and validation tools for AASA / App Links.
