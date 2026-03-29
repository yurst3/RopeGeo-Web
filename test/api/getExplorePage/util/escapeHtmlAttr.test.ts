import { describe, it, expect } from '@jest/globals';
import { escapeHtmlAttr } from '../../../../src/api/getExplorePage/util/escapeHtmlAttr';

describe('escapeHtmlAttr', () => {
    it('escapes ampersand, quotes, and angle brackets', () => {
        expect(escapeHtmlAttr('a & b')).toBe('a &amp; b');
        expect(escapeHtmlAttr('say "hi"')).toBe('say &quot;hi&quot;');
        expect(escapeHtmlAttr('1 < 2')).toBe('1 &lt; 2');
        expect(escapeHtmlAttr('2 > 1')).toBe('2 &gt; 1');
    });

    it('handles combined special characters', () => {
        expect(escapeHtmlAttr('<img src="x&y">')).toBe('&lt;img src=&quot;x&amp;y&quot;&gt;');
    });

    it('leaves plain text unchanged', () => {
        expect(escapeHtmlAttr('RopeGeo')).toBe('RopeGeo');
    });
});
