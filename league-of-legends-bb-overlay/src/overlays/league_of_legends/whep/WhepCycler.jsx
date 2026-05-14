import { useEffect, useMemo, useRef, useState } from "react";
import { connectWhep } from "./whep";
import {
    WHEP_CYCLE_INTERVAL_MS,
    WHEP_POSITION_A_URLS,
    WHEP_POSITION_B_URLS,
} from "./whepConfig";
import "./whepCycler.scss";

/**
 * Plays two WHEP streams in fixed on-screen positions ("A" and "B"), cycling
 * the active URL pair every `WHEP_CYCLE_INTERVAL_MS`.
 *
 * All unique URLs across both positions are opened on mount and kept open
 * for the lifetime of the component — switching the visible pair just swaps
 * which `MediaStream` is attached to each <video>, so there is no
 * re-negotiation when the cycle advances.
 *
 * Mount this once at the layout root (it positions itself absolutely).
 */
export default function WhepCycler() {
    const [streams, setStreams] = useState({});
    const sessionsRef = useRef({});
    const [cycleIndex, setCycleIndex] = useState(0);

    const cycleLength = Math.max(
        WHEP_POSITION_A_URLS.length,
        WHEP_POSITION_B_URLS.length,
    );

    const uniqueUrls = useMemo(() => {
        const set = new Set();
        for (const u of WHEP_POSITION_A_URLS) if (u) set.add(u);
        for (const u of WHEP_POSITION_B_URLS) if (u) set.add(u);
        return Array.from(set);
    }, []);

    // Open one persistent WHEP session per unique URL.
    useEffect(() => {
        const current = sessionsRef.current;

        for (const url of uniqueUrls) {
            if (current[url]) continue;
            const entry = { session: null, cancelled: false };
            current[url] = entry;

            connectWhep(url)
                .then((session) => {
                    if (entry.cancelled) {
                        session.close().catch(() => undefined);
                        return;
                    }
                    entry.session = session;
                    setStreams((prev) => ({ ...prev, [url]: session.stream }));
                })
                .catch((err) => {
                    console.error(`[WHEP cycler] ${url}`, err);
                    if (!entry.cancelled) delete current[url];
                });
        }

        return () => {
            for (const url of Object.keys(current)) {
                current[url].cancelled = true;
                const session = current[url].session;
                if (session) session.close().catch(() => undefined);
            }
            sessionsRef.current = {};
        };
    }, [uniqueUrls]);

    // Advance the visible pair every WHEP_CYCLE_INTERVAL_MS.
    useEffect(() => {
        if (cycleLength <= 1) return undefined;
        const id = setInterval(() => {
            setCycleIndex((i) => (i + 1) % cycleLength);
        }, WHEP_CYCLE_INTERVAL_MS);
        return () => clearInterval(id);
    }, [cycleLength]);

    const urlA = WHEP_POSITION_A_URLS[cycleIndex % WHEP_POSITION_A_URLS.length];
    const urlB = WHEP_POSITION_B_URLS[cycleIndex % WHEP_POSITION_B_URLS.length];
    const streamA = urlA ? streams[urlA] : null;
    const streamB = urlB ? streams[urlB] : null;

    return (
        <>
            <WhepVideoSlot
                position="a"
                stream={streamA}
                cycleIndex={cycleIndex}
                slotNumber={cycleIndex + 1}
            />
            <WhepVideoSlot
                position="b"
                stream={streamB}
                cycleIndex={cycleIndex}
                slotNumber={cycleIndex + 6}
            />
        </>
    );
}

function WhepVideoSlot({ position, stream, slotNumber }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return undefined;
        if (stream) {
            if (v.srcObject !== stream) {
                v.srcObject = stream;
            }
            v.play().catch(() => undefined);
        } else if (v.srcObject) {
            v.srcObject = null;
        }
        return undefined;
    }, [stream]);

    return null;

    return (
        <div
            className={`whep-cycler whep-cycler--${position}`}
            data-slot={slotNumber}
        >
            <video
                ref={videoRef}
                className="whep-cycler__video"
                autoPlay
                playsInline
                muted
            />
            <div className="whep-cycler__debug-index">{slotNumber}</div>
        </div>
    );
}
