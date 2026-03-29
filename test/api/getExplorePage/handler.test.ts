import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getS3Object, httpRequest } from 'ropegeo-common/helpers';
import { handler } from '../../../src/api/getExplorePage/handler';
import { landingHtmlWithPlaceholder } from './fixtures/landingHtml';
import { linkPreviewApiEnvelope, linkPreviewResultNoImage } from './fixtures/linkPreviewJson';

jest.mock('ropegeo-common/helpers', () => ({
    getS3Object: jest.fn(),
    httpRequest: jest.fn(),
}));

const mockedGetS3Object = jest.mocked(getS3Object);
const mockedHttpRequest = jest.mocked(httpRequest);

function event(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
    const id = 'a1b2c3d4-e5f6-4780-abcd-ef1234567890';
    return {
        version: '2.0',
        routeKey: 'GET /explore/{id}/page',
        rawPath: `/explore/${id}/page`,
        rawQueryString: 'source=ropewiki',
        headers: {
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'mobile.ropegeo.com',
        },
        requestContext: {
            accountId: '123',
            apiId: 'abc',
            domainName: 'abc.execute-api.us-east-1.amazonaws.com',
            domainPrefix: 'abc',
            http: {
                method: 'GET',
                path: `/explore/${id}/page`,
                protocol: 'HTTP/1.1',
                sourceIp: '1.1.1.1',
                userAgent: 'test',
            },
            requestId: 'id',
            routeKey: 'GET /explore/{id}/page',
            stage: '$default',
            time: '01/Jan/2025:00:00:00 +0000',
            timeEpoch: 0,
        },
        pathParameters: { id },
        isBase64Encoded: false,
        ...overrides,
    } as APIGatewayProxyEventV2;
}

describe('getExplorePage handler', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        process.env.LANDING_BUCKET_NAME = 'landing-bucket';
        process.env.LANDING_INDEX_KEY = 'index.html';
        process.env.WEBSCRAPER_API_BASE_URL = 'https://api.example.com';
        process.env.LANDING_HTML_CACHE_TTL_SECONDS = '0';
        const { clearLandingHtmlCacheForTests } = await import(
            '../../../src/api/getExplorePage/s3/cachedLandingPage'
        );
        clearLandingHtmlCacheForTests();
    });

    it('returns 400 for missing id', async () => {
        const res = await handler(event({ pathParameters: undefined }));
        expect(res.statusCode).toBe(400);
    });

    it('returns 200 and injects meta when S3 and WebScraper succeed', async () => {
        mockedGetS3Object.mockResolvedValueOnce({
            body: landingHtmlWithPlaceholder,
        });

        mockedHttpRequest.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () =>
                linkPreviewApiEnvelope({
                    ...linkPreviewResultNoImage,
                    title: 'T',
                    description: 'D',
                }),
        } as unknown as Response);

        const res = await handler(event());
        expect(res.statusCode).toBe(200);
        expect(res.headers['cache-control']).toContain('public');
        expect(res.headers['cache-control']).toContain('s-maxage');
        expect(typeof res.body).toBe('string');
        expect(res.body).toContain('og:title');
        expect(res.body).toContain('content="T"');
        expect(res.body).toContain('og:url');
        expect(res.body).toContain('mobile.ropegeo.com');
        expect(mockedHttpRequest).toHaveBeenCalledWith(
            'https://api.example.com/ropewiki/page/a1b2c3d4-e5f6-4780-abcd-ef1234567890/link-preview',
            5,
            undefined,
            undefined,
            false,
        );
    });

    it('returns 404 when WebScraper returns 404', async () => {
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockedGetS3Object.mockResolvedValueOnce({
            body: landingHtmlWithPlaceholder,
        });
        mockedHttpRequest.mockRejectedValueOnce(
            new Error(
                'httpRequest non-OK: status=404 statusText=Not Found requestUrl=https://api.example.com/ropewiki/page/a1b2c3d4-e5f6-4780-abcd-ef1234567890/link-preview finalUrl=... server=(none) responseBody=not found',
            ),
        );

        const res = await handler(event());
        expect(res.statusCode).toBe(404);
        expect(res.headers['cache-control']).toBe('no-store');
        errSpy.mockRestore();
    });
});
