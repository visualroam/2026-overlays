import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { connectWhep } from "./whep";
import {
    WHEP_CYCLE_INTERVAL_MS,
    WHEP_POSITION_A_URLS,
    WHEP_POSITION_B_URLS,
} from "./whepConfig";
import "./whepCycler.scss";

const WhepCyclerContext = createContext(null);

/** Holds WHEP sessions + cycle index; wrap sections that render `WhepCyclerSide`. */
export function WhepCyclerProvider({ children }) {
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

    useEffect(() => {
        if (cycleLength <= 1) return undefined;
        const id = setInterval(() => {
            setCycleIndex((i) => (i + 1) % cycleLength);
        }, WHEP_CYCLE_INTERVAL_MS);
        return () => clearInterval(id);
    }, [cycleLength]);

    const value = useMemo(
        () => ({
            streams,
            cycleIndex,
            cycleLength,
            urlA: WHEP_POSITION_A_URLS[cycleIndex % WHEP_POSITION_A_URLS.length],
            urlB: WHEP_POSITION_B_URLS[cycleIndex % WHEP_POSITION_B_URLS.length],
            slotA: cycleIndex + 1,
            slotB: cycleIndex + 6,
        }),
        [streams, cycleIndex, cycleLength],
    );

    return (
        <WhepCyclerContext.Provider value={value}>
            {children}
        </WhepCyclerContext.Provider>
    );
}

/** One camera column: `which` is `"a"` (slots 1–5) or `"b"` (6–10). */
export function WhepCyclerSide({ which }) {
    const ctx = useContext(WhepCyclerContext);
    if (!ctx) {
        console.warn("WhepCyclerSide must be inside WhepCyclerProvider");
        return null;
    }

    const { streams, urlA, urlB, slotA, slotB } = ctx;
    const position = which === "b" ? "b" : "a";
    const url = which === "b" ? urlB : urlA;
    const slotNumber = which === "b" ? slotB : slotA;
    const stream = url ? streams[url] : null;

    return (
        <WhepVideoSlotInternal
            position={position}
            stream={stream}
            slotNumber={slotNumber}
        />
    );
}

/** Standalone floating pair (full-screen corners). Use Provider + two absolute children internally. */
export default function WhepCycler() {
    return (
        <WhepCyclerProvider>
            <WhepCyclerSide which="a" />
            <WhepCyclerSide which="b" />
        </WhepCyclerProvider>
    );
}

function WhepVideoSlotInternal({ position, stream, slotNumber }) {
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
