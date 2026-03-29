import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { injectLinkPreviewMeta } from '../../../../src/api/getExplorePage/util/injectLinkPreviewMeta';
import {
    landingHtmlWithPlaceholder,
    landingHtmlWithoutPlaceholder,
} from '../fixtures/landingHtml';

describe('injectLinkPreviewMeta', () => {
    const meta = '<meta property="og:title" content="T" />';
    let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

    beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it('replaces LINK_PREVIEW_HEAD placeholder with meta block', () => {
        const out = injectLinkPreviewMeta(landingHtmlWithPlaceholder, meta);
        expect(out).toContain(meta);
        expect(out).not.toContain('<!-- LINK_PREVIEW_HEAD -->');
    });

    it('appends meta after opening head when placeholder is missing', () => {
        const out = injectLinkPreviewMeta(landingHtmlWithoutPlaceholder, meta);
        expect(out).toContain('<head>');
        expect(out).toContain(meta);
        expect(consoleWarnSpy).toHaveBeenCalled();
    });
});
