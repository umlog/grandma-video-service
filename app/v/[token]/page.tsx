'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface VideoData {
    name: string;
    videoUrl: string;
}

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
            <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-red-400 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4 p-4">
            {data ? (
                <>
                    <h1 className="text-white text-2xl">{data.name}님께 드리는 영상</h1>
                    <video
                        src={data.videoUrl}
                        controls
                        playsInline
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
