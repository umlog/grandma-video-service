'use client';
import { use, useEffect, useState } from 'react';

interface VideoData {
    name: string;
    videoUrl: string;
}

export default function VideoPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = use(params);
    const [data, setData] = useState<VideoData | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/video/${token}`)
            .then((r) => {
                if (!r.ok) throw new Error('영상을 찾을 수 없습니다.');
                return r.json();
            })
            .then(setData)
            .catch((e) => setError(e.message));
    }, [token]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-red-400 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
            {data ? (
                <>
                    <h1 className="text-white text-2xl">{data.name}님께 드리는 영상</h1>
                    <video
                        src={data.videoUrl}
                        autoPlay
                        controls
                        className="max-w-full rounded-lg"
                    />
                    <a
                        href={data.videoUrl}
                        download
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg"
                    >
                        영상 다운로드
                    </a>
                </>
            ) : (
                <p className="text-white">로딩 중...</p>
            )}
        </div>
    );
}
