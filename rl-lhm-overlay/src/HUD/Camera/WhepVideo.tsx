import React, { useEffect, useRef, useState } from "react";
import { connectWhep, WhepSession } from "./whep";

type Props = {
    url: string;
    muted?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

/**
 * Test-only WHEP player. Connects to `url`, attaches the resulting MediaStream
 * to a <video>, and tears the peer connection down on unmount or URL change.
 */
const WhepVideo = ({ url, muted = true, className, style }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let session: WhepSession | null = null;
        let cancelled = false;

        connectWhep(url)
            .then((s) => {
                if (cancelled) {
                    s.close();
                    return;
                }
                session = s;
                const video = videoRef.current;
                if (video) {
                    video.srcObject = s.stream;
                    video.play().catch(() => undefined);
                }
            })
            .catch((err) => {
                console.error("[WHEP]", err);
                if (!cancelled) setError(String(err?.message ?? err));
            });

        return () => {
            cancelled = true;
            if (session) session.close().catch(() => undefined);
            if (videoRef.current) videoRef.current.srcObject = null;
        };
    }, [url]);

    return (
        <video
            ref={videoRef}
            className={className}
            style={style}
            autoPlay
            playsInline
            muted={muted}
            data-whep-error={error ?? undefined}
        />
    );
};

export default WhepVideo;
