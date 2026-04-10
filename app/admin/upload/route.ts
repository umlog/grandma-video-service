import type { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2, getBucket } from '@/lib/r2-client';
import { getDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { recipientName, fileType } = await req.json();

        if (!recipientName || !fileType) {
            return Response.json(
                { error: 'recipientName and fileType are required' },
                { status: 400 }
            );
        }

        const r2 = getR2();
        const bucket = getBucket();
        const db = getDb();

        const token = uuidv4();
        const storageKey = `${token}.mp4`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: storageKey,
            ContentType: fileType,
        });
        const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

        await db.collection('videos').add({
            token,
            recipientName,
            storageKey,
            createdAt: new Date(),
            isActive: true,
        });

        return Response.json({ uploadUrl, token });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[upload] error:', message);
        return Response.json({ error: message }, { status: 500 });
    }
}
