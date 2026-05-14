import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useBlueBottleContext } from "../../../../BlueBottle";
import { getImagePath } from "../../../../../utils/images";
import "./UnifiedEventFeed.scss";

import { ReactComponent as SwordIcon } from "../../../../../assets/icons/sword.svg";
import objectiveExamples from "./1.json";
import killExamples from "./2.json";

const TTL_MS = 5000;
const FADE_MS = 350;
const MAX_VISIBLE = 8;
const MAX_BUFFER = 80;
const ROW_PX = 48;
const ROW_GAP_PX = 5;
const ROW_STRIDE_PX = ROW_PX + ROW_GAP_PX;

/** `true` = fixed last 8 rows for styling (no TTL, no fade removal). Set `false` for live overlay (5s TTL + fade). */
const FEED_STYLE_MODE = false;

/** While in style mode with no live feed, pick a new random JSON sample this often (ms). */
const DEMO_RANDOM_REFRESH_MS = 6000;

/** `true` = only kill rows (demo + `killFeedEvents`). Set `false` to also show objectives. */
const FEED_KILLS_ONLY = true;

/**
 * Demo rows from `1.json` / `2.json` are **off** by default (live `killFeedEvents` / `objectiveEvents` only).
 * Turn on demo data either:
 * - set `FEED_JSON_DEMO` to `true`, or
 * - add **`?feedDemo=1`** to the overlay URL (no rebuild).
 */
const FEED_JSON_DEMO = false;
const FEED_JSON_DEMO_QUERY = "feedDemo";

/** @typedef {'kill'|'objective'} FeedChannel */

function buildRowKey(channel, receivedAt, payload) {
  if (channel === "kill") {
    const k = payload?.killer?.id ?? "";
    const v = payload?.victim?.id ?? "";
    return `kill-${receivedAt}-${k}-${v}`;
  }
  return `obj-${receivedAt}-${payload?.objective ?? ""}-${payload?.killer ?? ""}`;
}

/**
 * @param {{ receivedAt: number, payload: unknown }} row
 * @param {FeedChannel} channel
 */
function normalizeRow(row, channel) {
  return {
    key: buildRowKey(channel, row.receivedAt, row.payload),
    channel,
    receivedAt: row.receivedAt,
    payload: row.payload,
    leaving: false,
  };
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mergeSortedUnique(existing, incoming) {
  const byKey = new Map(existing.map((r) => [r.key, r]));
  for (const r of incoming) {
    if (!byKey.has(r.key)) byKey.set(r.key, r);
  }
  const merged = Array.from(byKey.values()).sort((a, b) => a.receivedAt - b.receivedAt);
  if (merged.length > MAX_BUFFER) {
    return merged.slice(merged.length - MAX_BUFFER);
  }
  return merged;
}

/**
 * Example JSON uses captured `receivedAt` values from the past; TTL would hide
 * everything immediately. Shuffle then take up to `MAX_BUFFER` random events, sort
 * by time for remap, and compress into recent wall time so rows show.
 */
function mergeDemoFromJson() {
  /** @type {{ receivedAt: number, payload: unknown, channel: FeedChannel }[]} */
  const raw = [];
  for (const r of killExamples) {
    raw.push({ receivedAt: r.receivedAt, payload: r.payload, channel: "kill" });
  }
  if (!FEED_KILLS_ONLY) {
    for (const r of objectiveExamples) {
      raw.push({ receivedAt: r.receivedAt, payload: r.payload, channel: "objective" });
    }
  }
  if (raw.length === 0) return [];
  const shuffled = shuffleArray(raw);
  const trimmed =
    shuffled.length > MAX_BUFFER ? shuffled.slice(0, MAX_BUFFER) : shuffled;
  trimmed.sort((a, b) => a.receivedAt - b.receivedAt);
  const minT = trimmed[0].receivedAt;
  const maxT = trimmed[trimmed.length - 1].receivedAt;
  const span = Math.max(maxT - minT, 1);
  const windowMs = Math.min(4000, Math.max(span, trimmed.length * 120));
  const end = Date.now() - 400;
  const start = end - windowMs;
  return trimmed.map((r) => {
    const rel = (r.receivedAt - minT) / span;
    const receivedAt = Math.round(start + rel * (end - start));
    return normalizeRow({ receivedAt, payload: r.payload }, r.channel);
  });
}

function feedRowShellClassName(row) {
  const parts = [`unified-event-feed__row`, `unified-event-feed__row--${row.channel}`];
  if (row.channel === "kill") {
    const id = Number(row.payload?.ingameTeamId);
    if (Number.isFinite(id)) {
      parts.push(`unified-event-feed__row--teamId-${id}`);
    }
  }
  if(row.channel === "objective") {
    const id = row.payload?.team;
    if (Number.isFinite(id)) {
      parts.push(`unified-event-feed__row--teamId-${id}`);
    }
  }
  if (row.leaving) parts.push("is-leaving");
  return parts.join(" ");
}

function objectiveDragonSlug(objective) {
  if (!objective || typeof objective !== "string") return null;
  if (objective === "GRUB") return "grubs";
  if (objective === "BARON") return "baron";
  if (objective === "HERALD") return "herald";
  const m = objective.match(/^DRAGON_(.+)$/);
  if (!m) return null;
  return m[1].toLowerCase();
}

function objectiveIconPath(objective) {
  const slug = objectiveDragonSlug(objective);
  if (!slug) return null;
  if (slug === "grubs" || slug === "baron" || slug === "herald") {
    return getImagePath(`cache/style/ingame/objectives/baronpit/${slug}.png`);
  }
  return getImagePath(`cache/style/ingame/objectives/dragonpit/${slug}.png`);
}

export function UnifiedEventFeed() {
  const location = useLocation();

  const useJsonDemo = useMemo(() => {
    if (FEED_JSON_DEMO) return true;
    return new URLSearchParams(location.search).get(FEED_JSON_DEMO_QUERY) === "1";
  }, [location.search]);

  const feedLog = useMemo(
    () => new URLSearchParams(location.search).get("feedLog") === "1",
    [location.search]
  );

  const log = useCallback(
    (...args) => {
      if (feedLog || import.meta.env.DEV) {
        console.log("[UnifiedEventFeed]", ...args);
      }
    },
    [feedLog]
  );

  const { killFeedEvents, objectiveEvents } = useBlueBottleContext();

  const hasLive =
    (killFeedEvents?.length ?? 0) > 0 ||
    (!FEED_KILLS_ONLY && (objectiveEvents?.length ?? 0) > 0);

  /** TTL + fade when not in style mode and there is something to age out (live feed and/or JSON demo). */
  const useLiveExpiry = !FEED_STYLE_MODE && (hasLive || useJsonDemo);

  const [rows, setRows] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const lensRef = useRef({
    kill: 0,
    objective: 0,
  });
  const demoSeededRef = useRef(false);

  const drainChannel = useCallback((channel, arr, key) => {
    const L = lensRef.current;
    const prev = L[key];
    const incoming = [];
    if (!Array.isArray(arr) || arr.length === 0) {
      L[key] = 0;
      return incoming;
    }
    if (arr.length < prev) {
      L[key] = arr.length;
      return incoming;
    }
    if (arr.length > prev) {
      for (let i = prev; i < arr.length; i += 1) {
        incoming.push(normalizeRow(arr[i], channel));
      }
      L[key] = arr.length;
    }
    return incoming;
  }, []);

  useEffect(() => {
    if (!useJsonDemo) {
      demoSeededRef.current = false;
    } else if (!demoSeededRef.current) {
      demoSeededRef.current = true;
      const seeded = mergeDemoFromJson();
      log("seed from JSON (demo)", {
        rows: seeded.length,
        firstReceivedAt: seeded[0]?.receivedAt,
        lastReceivedAt: seeded[seeded.length - 1]?.receivedAt,
        now: Date.now(),
      });
      setRows(seeded);
    }

    const updates = [];
    updates.push(...drainChannel("kill", killFeedEvents, "kill"));
    if (!FEED_KILLS_ONLY) {
      updates.push(...drainChannel("objective", objectiveEvents, "objective"));
    }

    if (updates.length > 0) {
      log("live updates", {
        count: updates.length,
        killLen: killFeedEvents?.length ?? 0,
        objLen: objectiveEvents?.length ?? 0,
      });
      setRows((prev) => mergeSortedUnique(prev, updates));
    }
  }, [
    drainChannel,
    log,
    killFeedEvents,
    objectiveEvents,
    useJsonDemo,
  ]);

  useEffect(() => {
    if (useJsonDemo || hasLive) return;
    setRows([]);
  }, [useJsonDemo, hasLive]);

  useEffect(() => {
    if (!FEED_STYLE_MODE || hasLive || !useJsonDemo) return undefined;
    const id = window.setInterval(() => {
      setRows(mergeDemoFromJson());
    }, DEMO_RANDOM_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [hasLive, useJsonDemo]);

  useEffect(() => {
    if (!useLiveExpiry) return undefined;
    if (rows.length === 0) return undefined;
    let id = requestAnimationFrame(function tick() {
      setNow(Date.now());
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [useLiveExpiry, rows.length]);

  useEffect(() => {
    if (!useLiveExpiry) return;
    setRows((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        if (r.leaving) return r;
        if (now >= r.receivedAt + TTL_MS) {
          changed = true;
          return { ...r, leaving: true };
        }
        return r;
      });
      return changed ? next : prev;
    });
  }, [useLiveExpiry, now, rows.length]);

  useEffect(() => {
    if (useLiveExpiry) return;
    setRows((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        if (!r.leaving) return r;
        changed = true;
        return { ...r, leaving: false };
      });
      return changed ? next : prev;
    });
  }, [useLiveExpiry, rows.length]);

  const visible = useMemo(() => {
    const takeKillsOnly = (list) =>
      FEED_KILLS_ONLY ? list.filter((r) => r.channel === "kill") : list;

    if (!useLiveExpiry) {
      const ordered = takeKillsOnly([...rows].sort((a, b) => a.receivedAt - b.receivedAt));
      return ordered.slice(-MAX_VISIBLE);
    }
    const alive = takeKillsOnly(
      rows.filter((r) => {
        if (r.leaving) return now < r.receivedAt + TTL_MS + FADE_MS + 80;
        return now < r.receivedAt + TTL_MS;
      })
    );
    alive.sort((a, b) => a.receivedAt - b.receivedAt);
    return alive.slice(-MAX_VISIBLE);
  }, [rows, now, useLiveExpiry]);

  useEffect(() => {
    if (rows.length === 0) {
      log("no rows in state (nothing seeded or all removed)");
      return;
    }
    log("rows snapshot", {
      rows: rows.length,
      visible: visible.length,
      leaving: rows.filter((r) => r.leaving).length,
    });
  }, [log, rows.length, visible.length]);

  const onFeedRowTransitionEnd = useCallback((e) => {
    if (FEED_STYLE_MODE) return;
    if (e.currentTarget.dataset.feedLeaving !== "1") return;
    if (e.propertyName !== "opacity") return;
    const key = e.currentTarget?.dataset?.feedKey;
    if (!key) return;
    setRows((prev) => prev.filter((r) => r.key !== key));
  }, []);

  const n = visible.length;
  const baseY = (MAX_VISIBLE - n) * ROW_STRIDE_PX;

  if (n === 0) return null;

  return (
    <div className="unified-event-feed" aria-live="polite">
      <div className="unified-event-feed__viewport">
        {visible.map((row, i) => (
          <FeedRowShell
            key={row.key}
            row={row}
            translateY={baseY + i * ROW_STRIDE_PX}
            slotIndex={i}
            onTransitionEnd={onFeedRowTransitionEnd}
          />
        ))}
      </div>
    </div>
  );
}

/** Vertical stack on the slot; slide + opacity on the inner row (enter / leave). */
function FeedRowShell({ row, translateY, slotIndex, onTransitionEnd }) {
  const [enterSettled, setEnterSettled] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    let innerRaf = null;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        if (!cancelled) setEnterSettled(true);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      if (innerRaf != null) cancelAnimationFrame(innerRaf);
    };
  }, [row.key]);

  const entering = !enterSettled && !row.leaving;
  const innerClass = `${feedRowShellClassName(row)}${entering ? " is-entering" : ""}`;

  return (
    <div
      className="unified-event-feed__row-slot"
      style={{
        transform: `translateY(${translateY}px)`,
        zIndex: 10 + slotIndex,
      }}
    >
      <div
        className={innerClass}
        data-feed-key={row.key}
        data-feed-leaving={row.leaving ? "1" : "0"}
        onTransitionEnd={onTransitionEnd}
      >
        <FeedRowContent channel={row.channel} payload={row.payload} />
      </div>
    </div>
  );
}

function FeedRowContent({ channel, payload }) {
  if (channel === "kill") {
    const killer = payload?.killer ?? {};
    const victim = payload?.victim ?? {};
    const assisters = Array.isArray(payload?.assisters) ? payload.assisters : [];

    let imgPath = victim?.squareImg ?? victim?.splashCenteredImg ?? "";
    if(imgPath.includes("/style/")) {
      imgPath = imgPath.replace("/style/", "cache/style/");
    }
    let img = undefined;
    if(imgPath) {
      img = getImagePath(imgPath);
    }

    return (
      <div className="unified-event-feed__kill">
        {img && <img src={img} alt="" />}
        <span className="unified-event-feed__kill-vs">
          <SwordIcon className="unified-event-feed__kill-vs-icon" />
        </span>
        <img src={getImagePath(`${killer?.squareImg ?? killer?.splashCenteredImg ?? ""}`)} alt="" />
        {assisters.length > 0 && (
          <div className="unified-event-feed__kill-assists">
            {assisters.slice(0, 3).map((a) => (
              <img key={a?.id ?? a?.alias} src={getImagePath(`${a?.squareImg ?? ""}`)} alt="" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (channel === "objective") {
    const icon = objectiveIconPath(payload?.objective);
    return (
      <div className="unified-event-feed__kill">
        <img src={icon} alt="" style={{ border: "none" }} />
        <span className="unified-event-feed__kill-vs">
          <SwordIcon className="unified-event-feed__kill-vs-icon" />
        </span>
        <span className="unified-event-feed__objective-text">
          <span className="unified-event-feed__objective-type">KILLED BY</span>
          <span className="unified-event-feed__objective-killer">{payload?.killer ?? ""}</span>
        </span>
      </div>
    );
  }

  return null;
}
