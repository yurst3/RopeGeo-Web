import { httpRequest } from 'ropegeo-common/helpers';
import { LinkPreview } from 'ropegeo-common';

export type GetLinkPreviewResult =
    | { ok: true; preview: LinkPreview }
    | { ok: false; statusCode: number };

function statusCodeFromHttpRequestError(err: unknown): number {
    if (err instanceof Error) {
        const m = err.message.match(/\bstatus=(\d{3})\b/);
        if (m) {
            const status = Number(m[1]);
            return status === 404 ? 404 : 502;
        }
    }
    return 502;
}

/**
 * Fetches LinkPreview JSON from the WebScraper HTTP API.
 */
export async function getLinkPreview(apiBase: string, id: string): Promise<GetLinkPreviewResult> {
    const url = `${apiBase}/ropewiki/page/${id}/link-preview`;
    const retryCount = 5;
    const abortSignal = undefined;
    const requestInit = undefined;
    const useProxy = false;
    try {
        const res = await httpRequest(url, retryCount, abortSignal, requestInit, useProxy);
        const json: unknown = await res.json();
        if (json == null || typeof json !== 'object' || !('result' in json)) {
            throw new Error('Unexpected link-preview JSON shape');
        }
        const preview = LinkPreview.fromResult((json as { result: unknown }).result);
        return { ok: true, preview };
    } catch (e) {
        console.error('link-preview fetch/parse failed:', e);
        return { ok: false, statusCode: statusCodeFromHttpRequestError(e) };
    }
}
