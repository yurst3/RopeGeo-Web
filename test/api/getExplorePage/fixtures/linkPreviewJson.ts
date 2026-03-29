/**
 * Mock API JSON bodies for GET …/link-preview (shape matches WebScraper + LinkPreview.fromResult).
 */
export const linkPreviewResultNoImage = {
    title: 'Cassidy Canyon',
    description: '3A II PG13, 5 rappels',
    image: null,
    siteName: 'RopeGeo',
    type: 'website',
} as const;

export const linkPreviewResultWithImage = {
    title: 'Test Canyon',
    description: 'A short beta',
    image: {
        url: 'https://cdn.example.com/preview.avif',
        height: '300',
        width: '600',
        type: 'image/avif',
        alt: 'Canyon view',
    },
    siteName: 'RopeGeo',
    type: 'website',
} as const;

export function linkPreviewApiEnvelope(result: Record<string, unknown>) {
    return {
        resultType: 'ropewikiPageLinkPreview',
        result,
    };
}
