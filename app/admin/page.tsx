'use client';
import { useState, useRef } from 'react';

const CSS = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes stepPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(49,130,246,0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(49,130,246,0); }
}

.admin-wrap {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #F7F8FA;
    min-height: 100vh;
    padding: 2rem 1rem 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.card {
    width: 100%;
    max-width: 440px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    overflow: hidden;
}
.card-head {
    background: white;
    padding: 2rem 1.75rem 1.25rem;
    border-bottom: 1px solid #F2F3F5;
}
.field-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #6B7684;
    margin-bottom: 0.5rem;
}
.toss-input {
    width: 100%;
    padding: 0.9rem 1rem;
    border: 1.5px solid #E5E8EB;
    border-radius: 12px;
    font-family: 'Pretendard', sans-serif;
    font-size: 1rem;
    color: #191F28;
    background: white;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
}
.toss-input:focus {
    border-color: #3182F6;
    box-shadow: 0 0 0 3px rgba(49,130,246,0.12);
}
.file-zone {
    border: 1.5px dashed #D1D6DB;
    border-radius: 12px;
    padding: 1.75rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: #FAFAFA;
}
.file-zone:hover, .file-zone.active {
    border-color: #3182F6;
    background: rgba(49,130,246,0.03);
}
.upload-btn {
    width: 100%;
    padding: 1rem;
    background: #3182F6;
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'Pretendard', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
}
.upload-btn:hover:not(:disabled) { background: #1B64DA; }
.upload-btn:active:not(:disabled) { transform: scale(0.99); }
.upload-btn:disabled { background: #D1D6DB; cursor: not-allowed; }
.step-dot {
    width: 26px; height: 26px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; font-weight: 700;
    transition: background 0.3s, color 0.3s;
    flex-shrink: 0;
}
.step-dot.done    { background: #3182F6; color: white; }
.step-dot.active  { background: #3182F6; color: white; animation: stepPulse 1.4s infinite; }
.step-dot.pending { background: #F2F4F6; color: #B0B8C1; }
.qr-result { animation: fadeUp 0.4s ease both; }
.secondary-btn {
    flex: 1; padding: 0.875rem;
    border: 1.5px solid #E5E8EB;
    background: white; color: #4E5968;
    border-radius: 12px; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; font-family: 'Pretendard', sans-serif;
    transition: background 0.15s;
}
.secondary-btn:hover { background: #F7F8FA; }
`;

const STEPS = ['준비', '업로드', 'QR 생성', '완료'];

function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AdminPage() {
    const [recipientName, setRecipientName] = useState('');
    const [status, setStatus] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [currentStep, setCurrentStep] = useState(-1);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const isUploading = currentStep >= 0 && currentStep < 3;
    const isError = !!(status && (status.includes('실패') || status.includes('오류')));

    function pickFile(file: File) {
        setFileName(file.name);
        setFileSize(formatBytes(file.size));
        const dt = new DataTransfer();
        dt.items.add(file);
        if (fileRef.current) fileRef.current.files = dt.files;
    }

    async function handleUpload() {
        const file = fileRef.current?.files?.[0];
        if (!file || !recipientName.trim()) {
            setStatus('이름과 영상을 선택해주세요.');
            return;
        }
        try {
            setCurrentStep(0);
            setUploadProgress(0);
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
            setStatus('영상 업로드 중...');
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
                };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('영상 업로드 실패'));
                xhr.onerror = () => reject(new Error('영상 업로드 실패'));
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });

            setCurrentStep(2);
            setStatus('QR코드 생성 중...');
            const qrUrl = `${window.location.origin}/v/${token}`;
            setVideoLink(qrUrl);
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

    function copyLink() {
        navigator.clipboard.writeText(videoLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function reset() {
        setQrDataUrl('');
        setVideoLink('');
        setCurrentStep(-1);
        setUploadProgress(0);
        setStatus('');
        setFileName('');
        setFileSize('');
        setRecipientName('');
        setCopied(false);
        if (fileRef.current) fileRef.current.value = '';
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div className="admin-wrap">
                <div className="card">
                    {/* Header */}
                    <div className="card-head">
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3182F6', marginBottom: '0.4rem' }}>
                            영상 관리
                        </p>
                        <h1 style={{ color: '#191F28', fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                            영상 업로드
                        </h1>
                        <p style={{ color: '#8B95A1', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                            팔순 기념 영상을 업로드하고 QR코드를 생성하세요
                        </p>
                    </div>

                    {/* Step indicator */}
                    {currentStep >= 0 && (
                        <div style={{ padding: '1.25rem 1.75rem 0', display: 'flex', alignItems: 'flex-start' }}>
                            {STEPS.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                                        <div className={`step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'}`}>
                                            {i < currentStep ? '✓' : i + 1}
                                        </div>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: i <= currentStep ? '#3182F6' : '#B0B8C1', whiteSpace: 'nowrap' }}>
                                            {s}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div style={{
                                            flex: 1,
                                            height: '1.5px',
                                            background: i < currentStep ? '#3182F6' : '#E5E8EB',
                                            transition: 'background 0.4s',
                                            margin: '0 4px 1.1rem',
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: '1.5rem 1.75rem' }}>
                        {!qrDataUrl ? (
                            <>
                                {/* Name */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="field-label">받는 분 성함</label>
                                    <input
                                        className="toss-input"
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
                                        className={`file-zone ${fileName ? 'active' : ''} ${isDragging ? 'active' : ''}`}
                                        onClick={() => !isUploading && fileRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            if (isUploading) return;
                                            const f = e.dataTransfer.files[0];
                                            if (f) pickFile(f);
                                        }}
                                    >
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="video/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) pickFile(f);
                                            }}
                                        />
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                                stroke={fileName || isDragging ? '#3182F6' : '#B0B8C1'}
                                                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                {fileName
                                                    ? <><polyline points="20 6 9 17 4 12"/></>
                                                    : <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>
                                                }
                                            </svg>
                                        </div>
                                        <p style={{ color: fileName ? '#191F28' : '#8B95A1', fontSize: '0.9rem', fontWeight: fileName ? 600 : 400, margin: 0 }}>
                                            {isDragging ? '여기에 놓으세요' : fileName || '파일을 선택하거나 드래그하세요'}
                                        </p>
                                        {fileName && (
                                            <p style={{ color: '#8B95A1', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                {fileSize} · <span style={{ color: '#3182F6', fontWeight: 500 }}>변경하려면 클릭</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Upload progress */}
                                {currentStep === 1 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#4E5968', fontWeight: 500 }}>업로드 중...</span>
                                            <span style={{ fontSize: '0.8rem', color: '#3182F6', fontWeight: 700 }}>{uploadProgress}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#F2F4F6', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: '99px',
                                                background: '#3182F6',
                                                width: `${uploadProgress}%`,
                                                transition: 'width 0.2s ease',
                                            }} />
                                        </div>
                                    </div>
                                )}

                                {/* Status */}
                                {status && currentStep !== 1 && (
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        marginBottom: '1rem',
                                        fontSize: '0.875rem',
                                        background: isError ? '#FFF3F0' : '#F0F6FF',
                                        border: `1px solid ${isError ? '#FFCDD6' : '#C8DEFF'}`,
                                        color: isError ? '#E03131' : '#1B64DA',
                                        fontWeight: 500,
                                    }}>
                                        {status}
                                    </div>
                                )}

                                <button className="upload-btn" onClick={handleUpload} disabled={isUploading}>
                                    {isUploading ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                display: 'inline-block', width: '16px', height: '16px',
                                                border: '2px solid rgba(255,255,255,0.3)',
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
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    background: '#F0F6FF', borderRadius: '100px',
                                    padding: '0.4rem 0.875rem', marginBottom: '1.25rem',
                                }}>
                                    <span style={{ color: '#3182F6', fontSize: '0.8rem', fontWeight: 700 }}>QR코드 생성 완료</span>
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '1rem',
                                    border: '1px solid #E5E8EB',
                                    borderRadius: '16px',
                                    background: 'white',
                                    marginBottom: '1rem',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                }}>
                                    <img src={qrDataUrl} alt="QR코드" style={{ width: '180px', height: '180px', display: 'block' }} />
                                </div>
                                <p style={{ color: '#8B95A1', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                                    <strong style={{ color: '#191F28' }}>{recipientName}</strong>님의 QR코드가<br />자동으로 저장되었습니다
                                </p>

                                {/* Copy link */}
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    background: '#F7F8FA', borderRadius: '10px',
                                    padding: '0.6rem 0.75rem', marginBottom: '1rem', gap: '0.5rem',
                                }}>
                                    <span style={{
                                        flex: 1, fontSize: '0.78rem', color: '#6B7684',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {videoLink}
                                    </span>
                                    <button
                                        onClick={copyLink}
                                        style={{
                                            flexShrink: 0, padding: '0.35rem 0.75rem',
                                            background: copied ? '#E8F5E9' : '#3182F6',
                                            color: copied ? '#2E7D32' : 'white',
                                            border: 'none', borderRadius: '8px',
                                            fontSize: '0.78rem', fontWeight: 700,
                                            cursor: 'pointer', transition: 'background 0.2s',
                                            fontFamily: 'Pretendard, sans-serif',
                                        }}
                                    >
                                        {copied ? '복사됨 ✓' : '링크 복사'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <a
                                        href={qrDataUrl}
                                        download={`${recipientName}_QR.png`}
                                        style={{
                                            flex: 1, padding: '0.875rem', textAlign: 'center',
                                            background: '#3182F6',
                                            color: 'white', borderRadius: '12px',
                                            fontSize: '0.9rem', fontWeight: 700,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        QR 다시 저장
                                    </a>
                                    <button className="secondary-btn" onClick={reset}>
                                        새로 만들기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
