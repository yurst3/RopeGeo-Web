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
    // Payload 2.0: rawPath + requestContext.http; payload 1.0: top-level path only (no requestContext.http)
    const evt = event as APIGatewayProxyEventV2 & { path?: string };
    const path = evt.rawPath ?? evt.path ?? evt.requestContext.http?.path ?? '/';
    const qs = event.rawQueryString;
    const base = `${proto}://${host}${path}`;
    return qs != null && qs !== '' ? `${base}?${qs}` : base;
}
