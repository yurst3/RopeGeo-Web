import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getLandingPageHtml } from '../../../../src/api/getExplorePage/s3/getLandingPage';
import {
    clearLandingHtmlCacheForTests,
    getLandingPageHtmlCached,
} from '../../../../src/api/getExplorePage/s3/cachedLandingPage';

jest.mock('../../../../src/api/getExplorePage/s3/getLandingPage', () => ({
    getLandingPageHtml: jest.fn(),
}));

const mockedGetLanding = jest.mocked(getLandingPageHtml);

describe('getLandingPageHtmlCached', () => {
    beforeEach(() => {
        clearLandingHtmlCacheForTests();
        jest.clearAllMocks();
        delete process.env.LANDING_HTML_CACHE_TTL_SECONDS;
        delete process.env.LANDING_HTML_CACHE_VERSION;
    });

    it('refetches every time when TTL is 0', async () => {
        process.env.LANDING_HTML_CACHE_TTL_SECONDS = '0';
        mockedGetLanding.mockResolvedValue('<html></html>');
        await getLandingPageHtmlCached('b', 'k');
        await getLandingPageHtmlCached('b', 'k');
        expect(mockedGetLanding).toHaveBeenCalledTimes(2);
    });

    it('calls S3 once per warm instance when TTL is positive', async () => {
        process.env.LANDING_HTML_CACHE_TTL_SECONDS = '3600';
        mockedGetLanding.mockResolvedValue('<html>a</html>');
        const a = await getLandingPageHtmlCached('b', 'k');
        const b = await getLandingPageHtmlCached('b', 'k');
        expect(a).toBe(b);
        expect(mockedGetLanding).toHaveBeenCalledTimes(1);
    });

    it('refetches when LANDING_HTML_CACHE_VERSION changes', async () => {
        process.env.LANDING_HTML_CACHE_TTL_SECONDS = '3600';
        process.env.LANDING_HTML_CACHE_VERSION = 'v1';
        mockedGetLanding.mockResolvedValueOnce('<html>1</html>');
        await getLandingPageHtmlCached('b', 'k');
        process.env.LANDING_HTML_CACHE_VERSION = 'v2';
        mockedGetLanding.mockResolvedValueOnce('<html>2</html>');
        const second = await getLandingPageHtmlCached('b', 'k');
        expect(second).toBe('<html>2</html>');
        expect(mockedGetLanding).toHaveBeenCalledTimes(2);
    });
});
