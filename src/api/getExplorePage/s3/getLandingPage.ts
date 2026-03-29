import { getS3Object } from 'ropegeo-common/helpers';

/**
 * Loads the exported landing index HTML from S3.
 */
export async function getLandingPageHtml(bucket: string, key: string): Promise<string> {
    const { body } = await getS3Object(bucket, key);
    if (!body) {
        throw new Error('Empty S3 object body');
    }
    return body;
}
