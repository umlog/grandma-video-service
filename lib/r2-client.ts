import { S3Client } from '@aws-sdk/client-s3';

export function getR2() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error(
            `R2 env vars missing: ${[
                !accountId && 'R2_ACCOUNT_ID',
                !accessKeyId && 'R2_ACCESS_KEY_ID',
                !secretAccessKey && 'R2_SECRET_ACCESS_KEY',
            ]
                .filter(Boolean)
                .join(', ')}`
        );
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    });
}

export function getBucket() {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) throw new Error('R2_BUCKET_NAME env var missing');
    return bucket;
}
