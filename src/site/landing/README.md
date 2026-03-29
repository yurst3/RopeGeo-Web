**Landing UI (Expo + React Native for Web)** lives in this folder: **`App.tsx`**, **`index.ts`**, and **`assets/`**.

The repo has a **single** `package.json` at the Web root. From the repo root:

- **Dev:** `npm run web` (or `npm start` then choose web)
- **Static export:** `npm run build:landing` → writes **`dist/`** at the repo root (then injects `<!-- LINK_PREVIEW_HEAD -->` into `dist/index.html`)

Deploy uploads **`dist/`** to the landing S3 bucket, not the contents of `src/site/landing/` directly.
