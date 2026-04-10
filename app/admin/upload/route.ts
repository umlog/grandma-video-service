import type { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, BUCKET } from '@/lib/r2-client';
import { db } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    const { recipientName, fileType } = await req.json();

    const token = uuidv4();
    const storageKey = `${token}.mp4`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
        ContentType: fileType || 'video/mp4',
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
}
