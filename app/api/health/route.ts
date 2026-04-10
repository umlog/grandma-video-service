export async function GET() {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
    const parsedKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    const vars = {
        R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
        R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? '',
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY_starts: parsedKey.slice(0, 40),
        FIREBASE_PRIVATE_KEY_ends: parsedKey.slice(-20),
    };

    return Response.json({ vars });
}
