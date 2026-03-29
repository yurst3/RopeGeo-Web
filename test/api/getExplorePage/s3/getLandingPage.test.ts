import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getS3Object } from 'ropegeo-common/helpers';
import { getLandingPageHtml } from '../../../../src/api/getExplorePage/s3/getLandingPage';
import { landingHtmlWithPlaceholder } from '../fixtures/landingHtml';

jest.mock('ropegeo-common/helpers', () => ({
    getS3Object: jest.fn(),
}));

const mockedGetS3Object = jest.mocked(getS3Object);

describe('getLandingPageHtml', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns HTML string from getS3Object body', async () => {
        mockedGetS3Object.mockResolvedValueOnce({
            body: landingHtmlWithPlaceholder,
            contentType: 'text/html',
        });

        const html = await getLandingPageHtml('my-bucket', 'index.html');

        expect(html).toBe(landingHtmlWithPlaceholder);
        expect(mockedGetS3Object).toHaveBeenCalledWith('my-bucket', 'index.html');
    });

    it('throws when S3 body is empty string', async () => {
        mockedGetS3Object.mockResolvedValueOnce({ body: '' });

        await expect(getLandingPageHtml('b', 'k')).rejects.toThrow('Empty S3 object body');
    });

    it('propagates getS3Object errors', async () => {
        mockedGetS3Object.mockRejectedValueOnce(new Error('NoSuchKey'));

        await expect(getLandingPageHtml('b', 'missing.html')).rejects.toThrow('NoSuchKey');
    });
});
