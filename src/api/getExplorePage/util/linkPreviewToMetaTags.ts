import type { LinkPreview } from 'ropegeo-common';
import { escapeHtmlAttr } from './escapeHtmlAttr';

export function linkPreviewToMetaTags(preview: LinkPreview, ogUrl: string): string {
    const lines: string[] = [];
    const t = escapeHtmlAttr(preview.title);
    const d = escapeHtmlAttr(preview.description);
    const site = escapeHtmlAttr(preview.siteName);
    const typ = escapeHtmlAttr(preview.type);
    const url = escapeHtmlAttr(ogUrl);

    lines.push(`<meta property="og:title" content="${t}" />`);
    lines.push(`<meta property="og:description" content="${d}" />`);
    lines.push(`<meta property="og:site_name" content="${site}" />`);
    lines.push(`<meta property="og:type" content="${typ}" />`);
    lines.push(`<meta property="og:url" content="${url}" />`);

    const img = preview.image;
    if (img != null) {
        const iu = escapeHtmlAttr(img.url);
        const iw = escapeHtmlAttr(img.width);
        const ih = escapeHtmlAttr(img.height);
        const it = escapeHtmlAttr(img.type);
        const ia = escapeHtmlAttr(img.alt);
        lines.push(`<meta property="og:image" content="${iu}" />`);
        lines.push(`<meta property="og:image:url" content="${iu}" />`);
        lines.push(`<meta property="og:image:width" content="${iw}" />`);
        lines.push(`<meta property="og:image:height" content="${ih}" />`);
        lines.push(`<meta property="og:image:type" content="${it}" />`);
        lines.push(`<meta property="og:image:alt" content="${ia}" />`);
        lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
        lines.push(`<meta name="twitter:title" content="${t}" />`);
        lines.push(`<meta name="twitter:description" content="${d}" />`);
        lines.push(`<meta name="twitter:image" content="${iu}" />`);
    }

    return lines.join('\n    ');
}
