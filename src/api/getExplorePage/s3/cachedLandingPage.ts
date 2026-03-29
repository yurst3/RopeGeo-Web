import { getLandingPageHtml } from './getLandingPage';

type LandingHtmlCacheEntry = { html: string; version: string; expiresAt: number };

let landingHtmlCache: LandingHtmlCacheEntry | null = null;

function cacheTtlMs(): number {
    const sec = Number(process.env.LANDING_HTML_CACHE_TTL_SECONDS ?? 300);
    if (!Number.isFinite(sec) || sec <= 0) {
        return 0;
    }
    return sec * 1000;
}

function cacheVersion(): string {
    return process.env.LANDING_HTML_CACHE_VERSION ?? '';
}

/**
 * Loads landing index.html from S3 with per-Lambda-instance in-memory cache (TTL + optional version bust).
 */
export async function getLandingPageHtmlCached(bucket: string, key: string): Promise<string> {
    const ttlMs = cacheTtlMs();
    const version = cacheVersion();
    const now = Date.now();
    if (
        ttlMs > 0 &&
        landingHtmlCache &&
        landingHtmlCache.version === version &&
        now < landingHtmlCache.expiresAt
    ) {
        return landingHtmlCache.html;
    }
    const html = await getLandingPageHtml(bucket, key);
    if (ttlMs > 0) {
        landingHtmlCache = { html, version, expiresAt: now + ttlMs };
    } else {
        landingHtmlCache = null;
    }
    return html;
}

/** Test-only: clear module cache between tests. */
export function clearLandingHtmlCacheForTests(): void {
    landingHtmlCache = null;
}
