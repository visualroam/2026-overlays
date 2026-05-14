import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { connectWhep, WhepSession } from "./whep";
import { configs } from "../../App";

export const SLOTS = [1, 2, 3, 4, 5, 6] as const;
export type Slot = (typeof SLOTS)[number];

type SlotStreams = Partial<Record<Slot, MediaStream>>;

type Ctx = {
    streams: SlotStreams;
};

const WhepStreamsContext = createContext<Ctx>({ streams: {} });

const slotFieldName = (slot: Slot) => `whep_url_${slot}` as const;

const extractSlotUrls = (data: any): Partial<Record<Slot, string>> => {
    const result: Partial<Record<Slot, string>> = {};
    const section = data?.camera_settings;
    if (!section || typeof section !== "object") return result;
    for (const slot of SLOTS) {
        const raw = section[slotFieldName(slot)];
        if (typeof raw === "string") {
            const trimmed = raw.trim();
            if (trimmed) result[slot] = trimmed;
        }
    }
    return result;
};

type SessionEntry = {
    url: string;
    session: WhepSession | null;
    cancelled: boolean;
};

/**
 * Owns the 6 WHEP sessions and keeps them alive for the entire HUD lifetime,
 * independent of which player cam boxes are mounted at any given moment.
 * Streams are exposed via `useWhepSlotStream(slot)`.
 *
 * Mount once at the layout root.
 */
export const WhepStreamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [slotUrls, setSlotUrls] = useState<Partial<Record<Slot, string>>>(() =>
        extractSlotUrls(configs.data),
    );
    const [streams, setStreams] = useState<SlotStreams>({});

    // Track active sessions outside of React state so we can compare against
    // the latest URL set without racing renders.
    const sessionsRef = useRef<Partial<Record<Slot, SessionEntry>>>({});

    useEffect(() => {
        const onChange = (data: any) => {
            setSlotUrls(extractSlotUrls(data));
        };
        configs.onChange(onChange);
        onChange(configs.data);
    }, []);

    useEffect(() => {
        const current = sessionsRef.current;

        for (const slot of SLOTS) {
            const desiredUrl = slotUrls[slot];
            const existing = current[slot];

            if (!desiredUrl) {
                if (existing) {
                    existing.cancelled = true;
                    existing.session?.close().catch(() => undefined);
                    delete current[slot];
                    setStreams((prev) => {
                        if (!(slot in prev)) return prev;
                        const next = { ...prev };
                        delete next[slot];
                        return next;
                    });
                }
                continue;
            }

            if (existing && existing.url === desiredUrl) continue;

            if (existing) {
                existing.cancelled = true;
                existing.session?.close().catch(() => undefined);
                delete current[slot];
            }

            const entry: SessionEntry = { url: desiredUrl, session: null, cancelled: false };
            current[slot] = entry;

            connectWhep(desiredUrl)
                .then((session) => {
                    if (entry.cancelled) {
                        session.close().catch(() => undefined);
                        return;
                    }
                    entry.session = session;
                    setStreams((prev) => ({ ...prev, [slot]: session.stream }));
                })
                .catch((err) => {
                    console.error(`[WHEP slot ${slot}]`, err);
                    if (entry.cancelled) return;
                    delete current[slot];
                    setStreams((prev) => {
                        if (!(slot in prev)) return prev;
                        const next = { ...prev };
                        delete next[slot];
                        return next;
                    });
                });
        }
    }, [slotUrls]);

    useEffect(
        () => () => {
            const current = sessionsRef.current;
            for (const slot of SLOTS) {
                const entry = current[slot];
                if (entry) {
                    entry.cancelled = true;
                    entry.session?.close().catch(() => undefined);
                }
            }
            sessionsRef.current = {};
        },
        [],
    );

    const value = useMemo<Ctx>(() => ({ streams }), [streams]);

    return <WhepStreamsContext.Provider value={value}>{children}</WhepStreamsContext.Provider>;
};

export const useWhepSlotStream = (slot: Slot | null | undefined): MediaStream | null => {
    const { streams } = useContext(WhepStreamsContext);
    if (slot == null) return null;
    return streams[slot] ?? null;
};
