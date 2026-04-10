import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getApp() {
    if (getApps().length > 0) return getApps()[0];

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            `Firebase env vars missing: ${[
                !projectId && 'FIREBASE_PROJECT_ID',
                !clientEmail && 'FIREBASE_CLIENT_EMAIL',
                !privateKey && 'FIREBASE_PRIVATE_KEY',
            ]
                .filter(Boolean)
                .join(', ')}`
        );
    }

    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function getDb() {
    getApp();
    return getFirestore();
}
