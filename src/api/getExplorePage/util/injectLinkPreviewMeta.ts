import { LINK_PREVIEW_HEAD_PLACEHOLDER } from './constants';

export function injectLinkPreviewMeta(html: string, metaBlock: string): string {
    if (!html.includes(LINK_PREVIEW_HEAD_PLACEHOLDER)) {
        console.warn('index.html missing LINK_PREVIEW_HEAD placeholder; appending meta to head');
        return html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${metaBlock}\n`);
    }
    return html.replace(LINK_PREVIEW_HEAD_PLACEHOLDER, metaBlock);
}
