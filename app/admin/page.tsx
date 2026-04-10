'use client';
import { useState, useRef } from 'react';

export default function AdminPage() {
    const [recipientName, setRecipientName] = useState('');
    const [status, setStatus] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleUpload() {
        const file = fileRef.current?.files?.[0];
        if (!file || !recipientName.trim()) {
            setStatus('이름과 영상을 선택해주세요.');
            return;
        }

        try {
            setStatus('업로드 URL 생성 중...');
            const res = await fetch('/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientName, fileType: file.type }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`업로드 URL 생성 실패 (${res.status}): ${errText}`);
            }
            const { uploadUrl, token } = await res.json();

            setStatus('R2에 영상 업로드 중...');
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!uploadRes.ok) throw new Error('영상 업로드 실패');

            setStatus('QR코드 생성 중...');
            const qrUrl = `${window.location.origin}/v/${token}`;
            const QRCode = await import('qrcode');
            const dataUrl = await QRCode.toDataURL(qrUrl, { width: 400 });
            setQrDataUrl(dataUrl);

            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${recipientName}_QR.png`;
            a.click();

            setStatus('완료!');
        } catch (err) {
            setStatus(err instanceof Error ? err.message : '오류가 발생했습니다.');
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
            <h1 className="text-2xl font-bold">영상 업로드</h1>

            <input
                type="text"
                placeholder="받는 분 이름"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="border rounded px-3 py-2 w-64"
            />

            <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="w-64"
            />

            <button
                onClick={handleUpload}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                업로드 & QR 생성
            </button>

            {status && <p className="text-sm text-gray-600">{status}</p>}

            {qrDataUrl && (
                <img src={qrDataUrl} alt="QR코드" className="w-48 h-48" />
            )}
        </div>
    );
}
