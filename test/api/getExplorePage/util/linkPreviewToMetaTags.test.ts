import { describe, it, expect } from '@jest/globals';
import { LinkPreview } from 'ropegeo-common';
import { linkPreviewToMetaTags } from '../../../../src/api/getExplorePage/util/linkPreviewToMetaTags';
import { linkPreviewResultNoImage, linkPreviewResultWithImage } from '../fixtures/linkPreviewJson';

describe('linkPreviewToMetaTags', () => {
    const ogUrl = 'https://mobile.ropegeo.com/explore/u/page?source=ropewiki';

    it('builds og tags without image fields when preview has no image', () => {
        const preview = LinkPreview.fromResult({ ...linkPreviewResultNoImage });
        const meta = linkPreviewToMetaTags(preview, ogUrl);

        expect(meta).toContain('property="og:title" content="Cassidy Canyon"');
        expect(meta).toContain('property="og:description" content="3A II PG13, 5 rappels"');
        expect(meta).toContain('property="og:site_name" content="RopeGeo"');
        expect(meta).toContain('property="og:type" content="website"');
        expect(meta).toContain(`property="og:url" content="${ogUrl}"`);
        expect(meta).not.toContain('og:image');
        expect(meta).not.toContain('twitter:card');
    });

    it('includes og:image and twitter tags when preview has an image', () => {
        const preview = LinkPreview.fromResult({ ...linkPreviewResultWithImage });
        const meta = linkPreviewToMetaTags(preview, ogUrl);

        expect(meta).toContain('property="og:image" content="https://cdn.example.com/preview.avif"');
        expect(meta).toContain('name="twitter:card" content="summary_large_image"');
        expect(meta).toContain('name="twitter:image" content="https://cdn.example.com/preview.avif"');
    });

    it('escapes HTML in attribute values', () => {
        const preview = new LinkPreview(
            'A & B',
            '1 < 2',
            null,
            'Site "Name"',
            'type',
        );
        const meta = linkPreviewToMetaTags(preview, 'https://x.example/p?q=a&b=1');

        expect(meta).toContain('content="A &amp; B"');
        expect(meta).toContain('content="1 &lt; 2"');
        expect(meta).toContain('content="Site &quot;Name&quot;"');
        expect(meta).toContain('content="https://x.example/p?q=a&amp;b=1"');
    });
});
