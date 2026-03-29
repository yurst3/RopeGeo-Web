import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { EXPLORE_PAGE_ID_UUID_RE } from './util/constants';
import { buildOgUrl } from './util/buildOgUrl';
import { linkPreviewToMetaTags } from './util/linkPreviewToMetaTags';
import { fallbackHtml } from './util/fallbackHtml';
import { injectLinkPreviewMeta } from './util/injectLinkPreviewMeta';
import { getLandingPageHtml } from './s3/getLandingPage';
import { getLinkPreview } from './http/getLinkPreview';

export type ExplorePageHandlerResult = {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
};

const corsHeaders = (): Record<string, string> => ({
    'content-type': 'text/html; charset=utf-8',
    'access-control-allow-origin': '*',
});

/**
 * GET /explore/{id}/page — loads landing index.html from S3, fetches LinkPreview JSON from WebScraper, injects OG meta at <!-- LINK_PREVIEW_HEAD -->.
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<ExplorePageHandlerResult> => {
    const cors = corsHeaders();

    const id = event.pathParameters?.id?.trim();
    if (!id || !EXPLORE_PAGE_ID_UUID_RE.test(id)) {
        return {
            statusCode: 400,
            headers: cors,
            body: fallbackHtml(),
        };
    }

    const bucket = process.env.LANDING_BUCKET_NAME;
    const indexKey = process.env.LANDING_INDEX_KEY ?? 'index.html';
    const apiBase = process.env.WEBSCRAPER_API_BASE_URL?.replace(/\/$/, '');

    if (!bucket || !apiBase) {
        console.error('Missing LANDING_BUCKET_NAME or WEBSCRAPER_API_BASE_URL');
        return { statusCode: 500, headers: cors, body: fallbackHtml() };
    }

    let html: string;
    try {
        html = await getLandingPageHtml(bucket, indexKey);
    } catch (e) {
        console.error('S3 GetObject failed:', e);
        return { statusCode: 500, headers: cors, body: fallbackHtml() };
    }

    const previewResult = await getLinkPreview(apiBase, id);
    if (!previewResult.ok) {
        return {
            statusCode: previewResult.statusCode,
            headers: cors,
            body: fallbackHtml(),
        };
    }

    const ogUrl = buildOgUrl(event);
    const metaBlock = linkPreviewToMetaTags(previewResult.preview, ogUrl);
    const body = injectLinkPreviewMeta(html, metaBlock);

    return {
        statusCode: 200,
        headers: cors,
        body,
    };
};
