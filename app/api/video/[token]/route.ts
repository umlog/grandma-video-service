import type { NextRequest } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, BUCKET } from '@/lib/r2-client';
import { db } from '@/lib/firebase-admin';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

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

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: data.storageKey });
    const videoUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return Response.json({ name: data.recipientName, videoUrl });
}
