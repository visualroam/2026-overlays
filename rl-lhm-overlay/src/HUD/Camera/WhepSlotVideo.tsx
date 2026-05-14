import React, { useEffect, useRef } from "react";
import { Slot, useWhepSlotStream } from "./whepStreams";
import "./whepSlotVideo.scss";

type Props = {
    slot: Slot;
    className?: string;
    style?: React.CSSProperties;
    muted?: boolean;
};

/**
 * Renders the WHEP stream for the given slot, if one is connected. The
 * underlying RTCPeerConnection is owned by <WhepStreamsProvider> at the
 * layout root, so mounting/unmounting this component does not tear the
 * stream down.
 */
const WhepSlotVideo = ({ slot, className, style, muted = true }: Props) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const stream = useWhepSlotStream(slot);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (stream) {
            if (video.srcObject !== stream) {
                video.srcObject = stream;
            }
            video.play().catch(() => undefined);
        } else if (video.srcObject) {
            video.srcObject = null;
        }
    }, [stream]);

    if (!stream) return null;

    return (
        <video
            ref={videoRef}
            className={`whep-slot-video${className ? ` ${className}` : ""}`}
            style={style}
            autoPlay
            playsInline
            muted={muted}
            data-slot={slot}
        />
    );
};

export default WhepSlotVideo;
