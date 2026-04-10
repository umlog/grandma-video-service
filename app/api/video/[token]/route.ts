import type { NextRequest } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2, getBucket } from '@/lib/r2-client';
import { getDb } from '@/lib/firebase-admin';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const db = getDb();
        const snap = await db
            .collection('videos')
            .where('token', '==', token)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snap.empty) {
            return Response.json({ error: 'Not found' }, { status: 404 });
        }

        const data = snap.docs[0].data();

        const r2 = getR2();
        const bucket = getBucket();
        const command = new GetObjectCommand({ Bucket: bucket, Key: data.storageKey });
        const videoUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

        return Response.json({ name: data.recipientName, videoUrl });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[video] error:', message);
        return Response.json({ error: message }, { status: 500 });
    }
}
