'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface VideoData {
    name: string;
    videoUrl: string;
}

const CSS = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin { to { transform: rotate(360deg); } }

.anim-0 { animation: fadeUp 0.6s cubic-bezier(0.2,0.8,0.3,1) 0s    both; }
.anim-1 { animation: fadeUp 0.6s cubic-bezier(0.2,0.8,0.3,1) 0.1s  both; }
.anim-2 { animation: fadeUp 0.6s cubic-bezier(0.2,0.8,0.3,1) 0.2s  both; }
.anim-3 { animation: fadeUp 0.6s cubic-bezier(0.2,0.8,0.3,1) 0.3s  both; }

.dl-btn {
    background: #3182F6;
    transition: background 0.15s, transform 0.1s;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: 14px;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
}
.dl-btn:hover { background: #1B64DA; }
.dl-btn:active { transform: scale(0.99); }
`;

export default function VideoPage() {
    const params = useParams<{ token: string }>();
    const token = params?.token;
    const [data, setData] = useState<VideoData | null>(null);
    const [error, setError] = useState('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetch(`/api/video/${token}`)
            .then((r) => r.json())
            .then((json) => {
                if (json.error) throw new Error(json.error);
                setData(json);
            })
            .catch((e: Error) => setError(e.message));
    }, [token]);

    if (error) {
        return (
            <div style={{ fontFamily: "'Pretendard', -apple-system, sans-serif", background: '#F7F8FA', minHeight: '100vh' }}
                className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <style dangerouslySetInnerHTML={{ __html: CSS }} />
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: '#FFF3F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E03131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <p style={{ color: '#4E5968', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>{error}</p>
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            <main
                style={{
                    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
                    background: '#F7F8FA',
                    minHeight: '100vh',
                }}
                className="flex flex-col items-center px-5 py-10"
            >
                {data && !started ? (
                    /* ── 안내 화면 ── */
                    <div className="anim-0" style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', minHeight: '80vh', textAlign: 'center', gap: '2rem',
                    }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '24px',
                            background: '#EBF3FF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(1.75rem, 7vw, 2.25rem)',
                            fontWeight: 800, color: '#191F28',
                            letterSpacing: '-0.03em', lineHeight: 1.2,
                            textAlign: 'center',
                        }}>
                            {data.name}
                        </h1>
                        <button
                            onClick={() => setStarted(true)}
                            style={{
                                background: '#3182F6', color: 'white',
                                border: 'none', borderRadius: '16px',
                                fontSize: '1.15rem', fontWeight: 700,
                                padding: '1.1rem',
                                cursor: 'pointer', width: '100%', maxWidth: '320px',
                                fontFamily: 'Pretendard, sans-serif',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            영상 보기
                        </button>
                    </div>
                ) : data ? (
                    <>
                        {/* Title */}
                        <h1 className="anim-1" style={{
                            fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',
                            fontWeight: 800,
                            color: '#191F28',
                            lineHeight: 1.2,
                            marginBottom: '0.4rem',
                            letterSpacing: '-0.03em',
                            textAlign: 'center',
                        }}>
                            {data.name}
                        </h1>
                        <p className="anim-1" style={{
                            fontSize: '1rem',
                            color: '#8B95A1',
                            marginBottom: '2rem',
                            textAlign: 'center',
                        }}>
                            소중한 분들이 보내는 영상 메시지입니다
                        </p>

                        {/* Video card */}
                        <div className="anim-2" style={{
                            width: '100%', maxWidth: '480px', marginBottom: '1rem',
                            background: 'white', borderRadius: '20px',
                            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                        }}>
                            <video
                                src={data.videoUrl}
                                controls
                                playsInline
                                style={{ display: 'block', width: '100%', maxHeight: '50vh', objectFit: 'contain', background: '#000' }}
                            />
                        </div>

                        {/* Contact help */}
                        <div className="anim-3" style={{
                            width: '100%', maxWidth: '480px', marginBottom: '6rem',
                            background: 'white', borderRadius: '16px',
                            boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
                            padding: '1rem 1.25rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', color: '#191F28', fontWeight: 600 }}>
                                    정해균 010-9279-6084
                                </p>
                            </div>
                            <a
                                href="tel:01092796084"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    background: '#F0F6FF', color: '#3182F6',
                                    borderRadius: '10px', padding: '0.5rem 0.875rem',
                                    fontSize: '0.85rem', fontWeight: 700,
                                    textDecoration: 'none', whiteSpace: 'nowrap',
                                }}
                            >
                                전화하기
                            </a>
                        </div>

                        {/* Download — fixed bottom bar */}
                        <div style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0,
                            padding: '0.875rem 1.25rem',
                            background: 'white',
                            borderTop: '1px solid #F2F3F5',
                            display: 'flex', justifyContent: 'center',
                        }}>
                            <a href={data.videoUrl} download className="dl-btn" style={{ maxWidth: '480px' }}>
                                영상 저장하기
                            </a>
                        </div>
                    </>
                ) : (
                    <div style={{ marginTop: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: '3px solid #E5E8EB', borderTopColor: '#3182F6',
                            animation: 'spin 0.9s linear infinite',
                        }} />
                        <p style={{ color: '#8B95A1', fontSize: '0.9rem', fontWeight: 500 }}>
                            영상을 불러오는 중...
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}
