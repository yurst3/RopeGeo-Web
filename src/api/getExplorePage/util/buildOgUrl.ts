import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export function buildOgUrl(event: APIGatewayProxyEventV2): string {
    const headers = event.headers ?? {};
    const lower: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
        if (v != null) {
            lower[k.toLowerCase()] = v;
        }
    }
    const proto = lower['x-forwarded-proto'] ?? 'https';
    const host = lower['x-forwarded-host'] ?? lower['host'] ?? event.requestContext.domainName;
    const path = event.rawPath ?? event.requestContext.http.path ?? '/';
    const qs = event.rawQueryString;
    const base = `${proto}://${host}${path}`;
    return qs != null && qs !== '' ? `${base}?${qs}` : base;
}
