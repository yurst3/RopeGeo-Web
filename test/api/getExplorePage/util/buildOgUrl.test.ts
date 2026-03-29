import { describe, it, expect } from '@jest/globals';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { buildOgUrl } from '../../../../src/api/getExplorePage/util/buildOgUrl';

function baseEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
    return {
        version: '2.0',
        routeKey: 'GET /explore/{id}/page',
        rawPath: '/explore/u/page',
        rawQueryString: '',
        headers: {},
        requestContext: {
            accountId: '123',
            apiId: 'abc',
            domainName: 'abc.execute-api.us-east-1.amazonaws.com',
            domainPrefix: 'abc',
            http: {
                method: 'GET',
                path: '/explore/u/page',
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
        isBase64Encoded: false,
        ...overrides,
    } as APIGatewayProxyEventV2;
}

describe('buildOgUrl', () => {
    it('uses x-forwarded-proto and x-forwarded-host when present', () => {
        const url = buildOgUrl(
            baseEvent({
                rawPath: '/explore/x/page',
                rawQueryString: 'a=1',
                headers: {
                    'x-forwarded-proto': 'https',
                    'x-forwarded-host': 'mobile.ropegeo.com',
                },
            }),
        );
        expect(url).toBe('https://mobile.ropegeo.com/explore/x/page?a=1');
    });

    it('omits query string when rawQueryString is empty', () => {
        const url = buildOgUrl(
            baseEvent({
                rawPath: '/p',
                rawQueryString: '',
                headers: {
                    'x-forwarded-proto': 'https',
                    'x-forwarded-host': 'h.example',
                },
            }),
        );
        expect(url).toBe('https://h.example/p');
    });

    it('falls back to host header and requestContext.http.path', () => {
        const url = buildOgUrl(
            baseEvent({
                rawPath: undefined as unknown as string,
                headers: { host: 'direct.example', 'x-forwarded-proto': 'http' },
                requestContext: {
                    ...baseEvent().requestContext,
                    http: { ...baseEvent().requestContext.http, path: '/fallback/path' },
                },
            }),
        );
        expect(url).toBe('http://direct.example/fallback/path');
    });

    it('falls back to domainName when host headers missing', () => {
        const url = buildOgUrl(
            baseEvent({
                headers: {},
                requestContext: {
                    ...baseEvent().requestContext,
                    domainName: 'only-domain.execute-api.us-east-1.amazonaws.com',
                },
            }),
        );
        expect(url).toBe('https://only-domain.execute-api.us-east-1.amazonaws.com/explore/u/page');
    });

    it('does not throw when requestContext.http is missing (payload 1.0 shape) if path is set', () => {
        const url = buildOgUrl({
            ...baseEvent({
                rawPath: undefined as unknown as string,
                headers: { host: 'mobile.ropegeo.com', 'x-forwarded-proto': 'https' },
                requestContext: {
                    accountId: '123',
                    apiId: 'abc',
                    domainName: 'abc.execute-api.us-east-1.amazonaws.com',
                    domainPrefix: 'abc',
                    requestId: 'id',
                    routeKey: 'GET /explore/{id}/page',
                    stage: '$default',
                    time: '01/Jan/2025:00:00:00 +0000',
                    timeEpoch: 0,
                } as APIGatewayProxyEventV2['requestContext'],
            }),
            path: '/explore/legacy/page',
        } as APIGatewayProxyEventV2);
        expect(url).toBe('https://mobile.ropegeo.com/explore/legacy/page');
    });
});
