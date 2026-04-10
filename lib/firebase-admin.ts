import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getApp() {
    if (getApps().length > 0) return getApps()[0];

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var missing');

    const serviceAccount = JSON.parse(raw);
    return initializeApp({ credential: cert(serviceAccount) });
}

export function getDb() {
    getApp();
    return getFirestore();
}
