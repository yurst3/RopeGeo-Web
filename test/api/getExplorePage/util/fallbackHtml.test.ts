import { describe, it, expect } from '@jest/globals';
import { fallbackHtml } from '../../../../src/api/getExplorePage/util/fallbackHtml';

describe('fallbackHtml', () => {
    it('returns minimal HTML error page with RopeGeo title', () => {
        const html = fallbackHtml();
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<title>RopeGeo</title>');
        expect(html).toContain('Unable to load this page preview');
    });
});
