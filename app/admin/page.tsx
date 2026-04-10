'use client';
import { useState, useRef } from 'react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&display=swap');

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes stepPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,162,87,0.5); }
    50%       { box-shadow: 0 0 0 6px rgba(201,162,87,0); }
}

.admin-wrap {
    font-family: 'Noto Serif KR', serif;
    background: linear-gradient(160deg, #FDF8F2 0%, #F5E8D5 100%);
    min-height: 100vh;
    padding: 1.5rem 1rem 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.card {
    width: 100%;
    max-width: 460px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 8px 48px rgba(139,94,58,0.13);
    overflow: hidden;
}
.card-head {
    background: linear-gradient(135deg, #2A1A1A 0%, #3D2525 100%);
    padding: 1.75rem 1.5rem;
    text-align: center;
}
.field-label {
    display: block;
    font-size: 0.75rem;
    color: #9B7B5E;
    letter-spacing: 0.15em;
    margin-bottom: 0.5rem;
}
.gold-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1.5px solid #EAD9BE;
    border-radius: 12px;
    font-family: 'Noto Serif KR', serif;
    font-size: 1rem;
    color: #2D1F1F;
    background: #FFFCF8;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
}
.gold-input:focus {
    border-color: #C9A257;
    box-shadow: 0 0 0 3px rgba(201,162,87,0.14);
}
.file-zone {
    border: 2px dashed #EAD9BE;
    border-radius: 14px;
    padding: 1.75rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.25s, background 0.25s;
}
.file-zone:hover, .file-zone.active {
    border-color: #C9A257;
    background: rgba(201,162,87,0.04);
}
.upload-btn {
    width: 100%;
    padding: 1.1rem;
    background: linear-gradient(135deg, #C9A257, #A87C2A);
    color: white;
    border: none;
    border-radius: 14px;
    font-family: 'Noto Serif KR', serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    cursor: pointer;
    box-shadow: 0 5px 22px rgba(201,162,87,0.42);
    transition: transform 0.2s, box-shadow 0.2s;
}
.upload-btn:active:not(:disabled) { transform: scale(0.98); }
.upload-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.step-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
    transition: background 0.35s, color 0.35s;
    flex-shrink: 0;
}
.step-dot.done    { background: #C9A257; color: white; }
.step-dot.active  { background: #C9A257; color: white; animation: stepPulse 1.4s infinite; }
.step-dot.pending { background: #F2EAE0; color: #C5B09A; }
.qr-result { animation: fadeUp 0.5s ease both; }
.secondary-btn {
    flex: 1; padding: 0.875rem;
    border: 1.5px solid #EAD9BE;
    background: white; color: #8B6B4E;
    border-radius: 12px; font-size: 0.9rem;
    cursor: pointer; font-family: 'Noto Serif KR', serif;
    transition: background 0.2s;
}
.secondary-btn:hover { background: #FFFCF8; }
`;

const STEPS = ['준비', '업로드', 'QR 생성', '완료'];

export default function AdminPage() {
    const [recipientName, setRecipientName] = useState('');
    const [status, setStatus] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [currentStep, setCurrentStep] = useState(-1);
    const [fileName, setFileName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const isUploading = currentStep >= 0 && currentStep < 3;
    const isError = status && status.includes('실패') || status.includes('오류');

    async function handleUpload() {
        const file = fileRef.current?.files?.[0];
        if (!file || !recipientName.trim()) {
            setStatus('이름과 영상을 선택해주세요.');
            return;
        }
        try {
            setCurrentStep(0);
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

            setCurrentStep(1);
            setStatus('R2에 영상 업로드 중...');
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });
            if (!uploadRes.ok) throw new Error('영상 업로드 실패');

            setCurrentStep(2);
            setStatus('QR코드 생성 중...');
            const qrUrl = `${window.location.origin}/v/${token}`;
            const QRCode = await import('qrcode');
            const dataUrl = await QRCode.toDataURL(qrUrl, { width: 400 });
            setQrDataUrl(dataUrl);

            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${recipientName}_QR.png`;
            a.click();

            setCurrentStep(3);
            setStatus('완료!');
        } catch (err) {
            setCurrentStep(-1);
            setStatus(err instanceof Error ? err.message : '오류가 발생했습니다.');
        }
    }

    function reset() {
        setQrDataUrl('');
        setCurrentStep(-1);
        setStatus('');
        setFileName('');
        setRecipientName('');
        if (fileRef.current) fileRef.current.value = '';
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div className="admin-wrap">
                <div className="card">
                    {/* Header */}
                    <div className="card-head">
                        <p style={{ color: '#C9A257', fontSize: '0.7rem', letterSpacing: '0.35em', marginBottom: '0.5rem' }}>
                            ✦ &nbsp; UPLOAD &nbsp; ✦
                        </p>
                        <h1 style={{ color: 'white', fontSize: '1.45rem', fontWeight: 600, letterSpacing: '0.06em', margin: 0 }}>
                            영상 업로드
                        </h1>
                        <p style={{ color: '#B5936B', fontSize: '0.8rem', marginTop: '0.35rem', letterSpacing: '0.05em' }}>
                            팔순 기념 영상 서비스
                        </p>
                    </div>

                    {/* Step indicator */}
                    {currentStep >= 0 && (
                        <div style={{ padding: '1.25rem 1.5rem 0', display: 'flex', alignItems: 'flex-start' }}>
                            {STEPS.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                                        <div className={`step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
                                            {i < currentStep ? '✓' : i + 1}
                                        </div>
                                        <span style={{ fontSize: '0.58rem', color: i <= currentStep ? '#C9A257' : '#C5B09A', whiteSpace: 'nowrap' }}>
                                            {s}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div style={{
                                            flex: 1,
                                            height: '1.5px',
                                            background: i < currentStep ? '#C9A257' : '#F0E6D3',
                                            marginBottom: '1.1rem',
                                            transition: 'background 0.4s',
                                            margin: '0 2px 1.1rem',
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: '1.5rem' }}>
                        {!qrDataUrl ? (
                            <>
                                {/* Name */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="field-label">받는 분 성함</label>
                                    <input
                                        className="gold-input"
                                        type="text"
                                        placeholder="예: 김복순"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* File zone */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="field-label">영상 파일</label>
                                    <div
                                        className={`file-zone ${fileName ? 'active' : ''}`}
                                        onClick={() => !isUploading && fileRef.current?.click()}
                                    >
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="video/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                                        />
                                        <div style={{ fontSize: '1.8rem', color: '#C9A257', marginBottom: '0.5rem' }}>
                                            {fileName ? '✓' : '▲'}
                                        </div>
                                        <p style={{ color: fileName ? '#5C3D2E' : '#C5B09A', fontSize: '0.9rem', fontWeight: fileName ? 600 : 400, margin: 0 }}>
                                            {fileName || '영상 파일을 선택하세요'}
                                        </p>
                                        {fileName && (
                                            <p style={{ color: '#C9A257', fontSize: '0.72rem', marginTop: '0.3rem' }}>탭하여 변경</p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                {status && (
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        marginBottom: '1rem',
                                        fontSize: '0.84rem',
                                        background: isError ? '#FFF5F5' : '#FFFCF8',
                                        border: `1px solid ${isError ? '#F5C5C5' : '#EAD9BE'}`,
                                        color: isError ? '#C0392B' : '#8B6B4E',
                                    }}>
                                        {status}
                                    </div>
                                )}

                                <button className="upload-btn" onClick={handleUpload} disabled={isUploading}>
                                    {isUploading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                display: 'inline-block', width: '15px', height: '15px',
                                                border: '2px solid rgba(255,255,255,0.35)',
                                                borderTopColor: 'white', borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite',
                                            }} />
                                            처리 중...
                                        </span>
                                    ) : '업로드 & QR 생성'}
                                </button>
                            </>
                        ) : (
                            <div className="qr-result" style={{ textAlign: 'center' }}>
                                <p style={{ color: '#B8912F', fontSize: '0.78rem', letterSpacing: '0.25em', marginBottom: '1.25rem' }}>
                                    ✦ &nbsp; QR코드가 생성되었습니다 &nbsp; ✦
                                </p>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '1.25rem',
                                    border: '1.5px solid #EAD9BE',
                                    borderRadius: '18px',
                                    background: '#FFFCF8',
                                    marginBottom: '1rem',
                                    boxShadow: '0 4px 20px rgba(139,94,58,0.08)',
                                }}>
                                    <img src={qrDataUrl} alt="QR코드" style={{ width: '190px', height: '190px', display: 'block' }} />
                                </div>
                                <p style={{ color: '#9B7B5E', fontSize: '0.84rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                    <strong style={{ color: '#5C3D2E' }}>{recipientName}</strong>님의 QR코드가<br />자동으로 저장되었습니다
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <a
                                        href={qrDataUrl}
                                        download={`${recipientName}_QR.png`}
                                        style={{
                                            flex: 1, padding: '0.875rem', textAlign: 'center',
                                            background: 'linear-gradient(135deg, #C9A257, #A87C2A)',
                                            color: 'white', borderRadius: '12px',
                                            fontSize: '0.9rem', fontWeight: 600,
                                            textDecoration: 'none', letterSpacing: '0.05em',
                                            boxShadow: '0 4px 18px rgba(201,162,87,0.38)',
                                        }}
                                    >
                                        ↓ 다시 저장
                                    </a>
                                    <button className="secondary-btn" onClick={reset}>
                                        + 새로 만들기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <p style={{ color: '#C5B09A', fontSize: '0.72rem', marginTop: '1.5rem', letterSpacing: '0.22em' }}>
                    ✦ &nbsp; 팔순 기념 영상 서비스 &nbsp; ✦
                </p>
            </div>
        </>
    );
}
