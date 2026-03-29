import { describe, it, expect } from '@jest/globals';
import {
    EXPLORE_PAGE_ID_UUID_RE,
    LINK_PREVIEW_HEAD_PLACEHOLDER,
} from '../../../../src/api/getExplorePage/util/constants';

describe('getExplorePage constants', () => {
    it('LINK_PREVIEW_HEAD_PLACEHOLDER matches injected marker', () => {
        expect(LINK_PREVIEW_HEAD_PLACEHOLDER).toBe('<!-- LINK_PREVIEW_HEAD -->');
    });

    it('EXPLORE_PAGE_ID_UUID_RE accepts RFC variant UUID v1–v8 style ids used by API', () => {
        expect(EXPLORE_PAGE_ID_UUID_RE.test('a1b2c3d4-e5f6-4780-abcd-ef1234567890')).toBe(true);
    });

    it('EXPLORE_PAGE_ID_UUID_RE rejects invalid ids', () => {
        expect(EXPLORE_PAGE_ID_UUID_RE.test('not-a-uuid')).toBe(false);
        expect(EXPLORE_PAGE_ID_UUID_RE.test('')).toBe(false);
    });
});
