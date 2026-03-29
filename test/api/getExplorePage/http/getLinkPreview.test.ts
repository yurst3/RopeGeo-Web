import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { httpRequest } from 'ropegeo-common/helpers';
import { getLinkPreview } from '../../../../src/api/getExplorePage/http/getLinkPreview';
import {
    linkPreviewApiEnvelope,
    linkPreviewResultNoImage,
    linkPreviewResultWithImage,
} from '../fixtures/linkPreviewJson';

jest.mock('ropegeo-common/helpers', () => ({
    httpRequest: jest.fn(),
}));

const mockedHttpRequest = jest.mocked(httpRequest);

describe('getLinkPreview', () => {
    const apiBase = 'https://api.example.com';
    const id = 'a1b2c3d4-e5f6-4780-abcd-ef1234567890';
    let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('calls httpRequest with url, retry count, and useProxy false', async () => {
        mockedHttpRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => linkPreviewApiEnvelope({ ...linkPreviewResultNoImage }),
        } as unknown as Response);

        await getLinkPreview(apiBase, id);

        expect(mockedHttpRequest).toHaveBeenCalledWith(
            `${apiBase}/ropewiki/page/${id}/link-preview`,
            5,
            undefined,
            undefined,
            false,
        );
    });

    it('returns ok preview from mock LinkPreview JSON (no image)', async () => {
        mockedHttpRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => linkPreviewApiEnvelope({ ...linkPreviewResultNoImage }),
        } as unknown as Response);

        const out = await getLinkPreview(apiBase, id);

        expect(out.ok).toBe(true);
        if (out.ok) {
            expect(out.preview.title).toBe('Cassidy Canyon');
            expect(out.preview.description).toBe('3A II PG13, 5 rappels');
            expect(out.preview.siteName).toBe('RopeGeo');
            expect(out.preview.type).toBe('website');
            expect(out.preview.image).toBeNull();
        }
    });

    it('returns ok preview from mock LinkPreview JSON (with image)', async () => {
        mockedHttpRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => linkPreviewApiEnvelope({ ...linkPreviewResultWithImage }),
        } as unknown as Response);

        const out = await getLinkPreview(apiBase, id);

        expect(out.ok).toBe(true);
        if (out.ok && out.preview.image) {
            expect(out.preview.image.url).toBe('https://cdn.example.com/preview.avif');
            expect(out.preview.image.alt).toBe('Canyon view');
        }
    });

    it('returns statusCode 404 when httpRequest fails with status=404', async () => {
        mockedHttpRequest.mockRejectedValueOnce(
            new Error('httpRequest non-OK: status=404 statusText=Not Found requestUrl=...'),
        );

        const out = await getLinkPreview(apiBase, id);
        expect(out).toEqual({ ok: false, statusCode: 404 });
    });

    it('returns statusCode 502 for other HTTP error statuses', async () => {
        mockedHttpRequest.mockRejectedValueOnce(
            new Error('httpRequest non-OK: status=500 statusText=ERR requestUrl=...'),
        );

        const out = await getLinkPreview(apiBase, id);
        expect(out).toEqual({ ok: false, statusCode: 502 });
    });

    it('returns statusCode 502 when JSON has no result field', async () => {
        mockedHttpRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ resultType: 'ropewikiPageLinkPreview' }),
        } as unknown as Response);

        const out = await getLinkPreview(apiBase, id);
        expect(out).toEqual({ ok: false, statusCode: 502 });
    });

    it('returns statusCode 502 when JSON is null', async () => {
        mockedHttpRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => null,
        } as unknown as Response);

        const out = await getLinkPreview(apiBase, id);
        expect(out).toEqual({ ok: false, statusCode: 502 });
    });
});
