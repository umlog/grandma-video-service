import { getDb } from '@/lib/firebase-admin';

export async function GET() {
    const results: Record<string, unknown> = {};

    try {
        const db = getDb();
        await db.collection('health').limit(1).get();
        results.firebase = 'ok';
    } catch (err) {
        results.firebase = err instanceof Error ? err.message : String(err);
    }

    try {
        const { getR2, getBucket } = await import('@/lib/r2-client');
        const { HeadBucketCommand } = await import('@aws-sdk/client-s3');
        const r2 = getR2();
        const bucket = getBucket();
        await r2.send(new HeadBucketCommand({ Bucket: bucket }));
        results.r2 = 'ok';
    } catch (err) {
        results.r2 = err instanceof Error ? err.message : String(err);
    }

    return Response.json(results);
}
