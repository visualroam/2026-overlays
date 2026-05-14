import { useMemo } from "react";
import WhepVideo from "./WhepVideo";
import { useConfig } from "../../API/contexts/actions";
import "./whepOverlay.scss";

type Props = {
    /**
     * The currently observed player's `observer_slot` (0-9). The overlay
     * for that slot is opacity-1; all other slots stay mounted at opacity-0
     * so their WHEP sessions stay alive in the background.
     * Pass `null`/`undefined` to hide everything.
     */
    observedSlot?: number | null;
};

// Slot order matches CS observer_slot: 1..9, then 0 (10th player on the "0" key).
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

type Slot = (typeof SLOTS)[number];

const slotFieldName = (slot: Slot) => `whep_url_${slot}` as const;

/**
 * Persistent multi-stream WHEP overlay. Connects to every URL filled in by
 * the LHM panel (`Camera settings > Player slot N — WHEP URL`) and keeps
 * the sessions open for the lifetime of the HUD. Only the video for the
 * currently observed slot is visible; the rest sit at opacity 0.
 *
 * Mount this once at the layout root.
 */
const WhepOverlay = ({ observedSlot }: Props) => {
    const cameraSettings = useConfig("camera_settings");

    const slotUrls = useMemo(() => {
        const result: Partial<Record<Slot, string>> = {};
        if (!cameraSettings) return result;
        for (const slot of SLOTS) {
            const raw = (cameraSettings as Record<string, string | undefined>)[slotFieldName(slot)];
            const trimmed = typeof raw === "string" ? raw.trim() : "";
            if (trimmed) result[slot] = trimmed;
        }
        return result;
    }, [cameraSettings]);

    return (
        <div className="whep-overlay">
            {SLOTS.map((slot) => {
                const url = slotUrls[slot];
                if (!url) return null;
                const visible = observedSlot === slot;
                return (
                    <div
                        key={slot}
                        className={`whep-overlay__slot${visible ? "" : " whep-overlay__slot--hidden"}`}
                        data-slot={slot}
                    >
                        <WhepVideo url={url} className="whep-overlay__video" />
                    </div>
                );
            })}
        </div>
    );
};

export default WhepOverlay;
