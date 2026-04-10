'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface VideoData {
    name: string;
    videoUrl: string;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');

@keyframes floatPetal {
    0%   { transform: translateY(-5vh) rotate(0deg) translateX(0px); opacity: 0; }
    8%   { opacity: 0.65; }
    92%  { opacity: 0.45; }
    100% { transform: translateY(108vh) rotate(540deg) translateX(30px); opacity: 0; }
}
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 1; }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes spinReverse { to { transform: rotate(-360deg); } }

.petal {
    position: fixed;
    border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
    animation: floatPetal linear infinite;
    pointer-events: none;
    z-index: 0;
}
.anim-0 { animation: fadeUp 0.9s cubic-bezier(0.2,0.8,0.3,1) 0s    both; }
.anim-1 { animation: fadeUp 0.9s cubic-bezier(0.2,0.8,0.3,1) 0.15s both; }
.anim-2 { animation: fadeUp 0.9s cubic-bezier(0.2,0.8,0.3,1) 0.3s  both; }
.anim-3 { animation: fadeUp 0.9s cubic-bezier(0.2,0.8,0.3,1) 0.45s both; }
.shimmer { animation: shimmer 3.5s ease-in-out infinite; }

.gold-ring {
    background: linear-gradient(135deg, #C9A257, #F0DFA0, #C9A257);
    padding: 2px;
    border-radius: 18px;
}
.dl-btn {
    background: linear-gradient(135deg, #C9A257 0%, #A87C2A 100%);
    box-shadow: 0 6px 28px rgba(201,162,87,0.45);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2.25rem;
    border-radius: 50px;
    color: white;
    font-weight: 600;
    letter-spacing: 0.08em;
    font-size: 0.95rem;
}
.dl-btn:active { transform: scale(0.97); box-shadow: 0 3px 14px rgba(201,162,87,0.3); }
`;

const PETALS = [
    { left: '6%',  dur: 7.5, delay: 0,    w: 10, color: '#F5C5D0' },
    { left: '18%', dur: 9.2, delay: 1.8,  w: 8,  color: '#E8D5A3' },
    { left: '32%', dur: 8.0, delay: 3.1,  w: 12, color: '#F5C5D0' },
    { left: '47%', dur: 10,  delay: 0.6,  w: 7,  color: '#D4B896' },
    { left: '61%', dur: 7.8, delay: 2.4,  w: 11, color: '#F5C5D0' },
    { left: '76%', dur: 8.8, delay: 4.2,  w: 9,  color: '#E8D5A3' },
    { left: '89%', dur: 9.5, delay: 1.1,  w: 8,  color: '#F5C5D0' },
];

export default function VideoPage() {
    const params = useParams<{ token: string }>();
    const token = params?.token;
    const [data, setData] = useState<VideoData | null>(null);
    const [error, setError] = useState('');

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
            <div style={{ fontFamily: "'Noto Serif KR', serif", background: 'linear-gradient(180deg,#FDF8F2,#F2E4D5)', minHeight: '100vh' }}
                className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <style dangerouslySetInnerHTML={{ __html: CSS }} />
                <span style={{ color: '#C9A257', fontSize: '2.5rem' }}>✦</span>
                <p style={{ color: '#8B5E5E', fontSize: '1rem', lineHeight: 1.8 }}>{error}</p>
            </div>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {PETALS.map((p, i) => (
                <div key={i} className="petal" style={{
                    left: p.left,
                    width: `${p.w}px`,
                    height: `${Math.round(p.w * 1.45)}px`,
                    backgroundColor: p.color,
                    animationDuration: `${p.dur}s`,
                    animationDelay: `${p.delay}s`,
                }} />
            ))}

            <main
                style={{
                    fontFamily: "'Noto Serif KR', serif",
                    background: 'linear-gradient(180deg, #FDF8F2 0%, #FAF0E2 45%, #F5E4D0 100%)',
                    minHeight: '100vh',
                }}
                className="relative z-10 flex flex-col items-center px-5 py-10"
            >
                {/* Top ornament */}
                <div className="anim-0 shimmer" style={{ color: '#C9A257', letterSpacing: '0.45em', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    ✦ &nbsp; ✦ &nbsp; ✦
                </div>

                {/* Badge */}
                <p className="anim-0" style={{
                    color: '#B8912F', fontSize: '0.75rem', letterSpacing: '0.3em',
                    textTransform: 'uppercase', marginBottom: '0.6rem',
                }}>
                    팔순을 진심으로 축하드립니다
                </p>

                {data ? (
                    <>
                        {/* Title */}
                        <h1 className="anim-1 text-center" style={{
                            fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
                            fontSize: 'clamp(2rem, 8vw, 3rem)',
                            fontWeight: 600,
                            color: '#2D1F1F',
                            lineHeight: 1.25,
                            marginBottom: '0.2rem',
                        }}>
                            {data.name}님께
                        </h1>
                        <p className="anim-1 text-center" style={{
                            fontSize: 'clamp(0.95rem, 4vw, 1.2rem)',
                            fontWeight: 300,
                            color: '#8B6B4E',
                            letterSpacing: '0.12em',
                            marginBottom: '1.75rem',
                        }}>
                            드리는 소중한 영상
                        </p>

                        {/* Divider */}
                        <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '420px', marginBottom: '1.75rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #C9A257)' }} />
                            <span style={{ color: '#C9A257', fontSize: '1.1rem' }}>✿</span>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #C9A257, transparent)' }} />
                        </div>

                        {/* Video */}
                        <div className="anim-2 gold-ring" style={{ width: '100%', maxWidth: '480px', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
                                <video
                                    src={data.videoUrl}
                                    controls
                                    playsInline
                                    style={{ display: 'block', width: '100%', maxHeight: '58vh', objectFit: 'contain' }}
                                />
                            </div>
                        </div>

                        {/* Download */}
                        <a href={data.videoUrl} download className="anim-3 dl-btn">
                            <span style={{ fontSize: '1.1rem' }}>↓</span> 영상 저장하기
                        </a>

                        {/* Bottom ornament */}
                        <div className="shimmer" style={{ color: '#C9A257', letterSpacing: '0.45em', fontSize: '0.8rem', marginTop: '2.5rem' }}>
                            ✦ &nbsp; ✦ &nbsp; ✦
                        </div>
                    </>
                ) : (
                    <div style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                border: '2px solid transparent', borderTopColor: '#C9A257',
                                animation: 'spin 1.2s linear infinite',
                            }} />
                            <div style={{
                                position: 'absolute', inset: '10px', borderRadius: '50%',
                                border: '1px solid transparent', borderTopColor: '#E8A0B0',
                                animation: 'spinReverse 0.8s linear infinite',
                            }} />
                            <span style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#C9A257', fontSize: '1rem',
                            }}>✿</span>
                        </div>
                        <p style={{ color: '#8B6B4E', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                            영상을 불러오는 중...
                        </p>
                    </div>
                )}
            </main>
        </>
    );
}
