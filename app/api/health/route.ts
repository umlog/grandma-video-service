import { getDb } from '@/lib/firebase-admin';

export async function GET() {
    const results: Record<string, unknown> = {};

    try {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var missing');
        JSON.parse(raw); // 파싱 가능한지 확인
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
