import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router";
import { getBlueBottleAddress, getBlueBottlePort } from "../utils/server_address";

const BlueBottleContext = createContext(null);

const MAX_RECONNECT_ATTEMPTS = 10;
/** Max rows kept per ingame event channel. */
const MAX_INGAME_CHANNEL_LOG = 500;

/** Each row: `{ receivedAt, payload }` — array fields from WS become one row per element. */
function buildChannelRows(raw, receivedAt) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item != null)
      .map((payload) => ({ receivedAt, payload }));
  }
  return [{ receivedAt, payload: raw }];
}

function appendChannelRows(setter, raw, receivedAt) {
  const rows = buildChannelRows(raw, receivedAt);
  if (rows.length === 0) return;
  setter((prev) => {
    const next = [...prev, ...rows];
    return next.length > MAX_INGAME_CHANNEL_LOG
      ? next.slice(next.length - MAX_INGAME_CHANNEL_LOG)
      : next;
  });
}

/**
 * Owns a single BlueBottle WebSocket for this subtree (`/ws/in` or `/ws/pre`).
 *
 * Context value:
 * - `isConnected`, `wsUrl`, `address`, `port`, `sendMessage`
 * - `lastMessage` — last parsed JSON frame (any type)
 * - `ingameState` — `data.state` from the latest `ingame-state-update` (or null)
 * - Per-channel append-only logs from `data.events` on `ingame-state-update` (`data.events` must be a
 *   plain object). Each entry is `{ receivedAt, payload }`. Arrays under a key become one entry per element.
 *   - `firstTowerEvents`, `killFeedEvents`, `objectiveEvents`, `smiteReactionEvents`, `teamEvents`, `playerKeyEvents`
 * - `clearIngameEvents()` — clears all of the above (e.g. between games)
 * - `championSelectState` — `data.state` from the latest `champion-select-state-update` (or null)
 * - `subscribe(listener)` — called on every parsed message; returns unsubscribe
 *
 * For ad‑hoc reactions use `subscribe` or `useBlueBottleMessage(type, handler)`.
 */
export function BlueBottleProvider({ children, wsPath }) {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [ingameState, setIngameState] = useState(null);
  const [firstTowerEvents, setFirstTowerEvents] = useState([]);
  const [killFeedEvents, setKillFeedEvents] = useState([]);
  const [objectiveEvents, setObjectiveEvents] = useState([]);
  const [smiteReactionEvents, setSmiteReactionEvents] = useState([]);
  const [teamEvents, setTeamEvents] = useState([]);
  const [playerKeyEvents, setPlayerKeyEvents] = useState([]);
  const [championSelectState, setChampionSelectState] = useState(null);

  const listenersRef = useRef(new Set());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);

  const { search, pathname } = location;
  const { address, port, wsUrl } = useMemo(() => {
    const a = getBlueBottleAddress();
    const p = getBlueBottlePort();
    return { address: a, port: p, wsUrl: `ws://${a}:${p}${wsPath}` };
  }, [search, pathname, wsPath]);

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const notifyListeners = useCallback((data) => {
    listenersRef.current.forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        console.error("[BlueBottleContext] subscriber error:", e);
      }
    });
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        typeof message === "string" ? message : JSON.stringify(message)
      );
    } else {
      console.warn("[BlueBottleContext] WebSocket is not connected");
    }
  }, []);

  const clearIngameEvents = useCallback(() => {
    setFirstTowerEvents([]);
    setKillFeedEvents([]);
    setObjectiveEvents([]);
    setSmiteReactionEvents([]);
    setTeamEvents([]);
    setPlayerKeyEvents([]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearReconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    function scheduleReconnect() {
      if (cancelled) return;
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.warn("[BlueBottleContext] Max reconnect attempts reached.");
        return;
      }
      reconnectAttemptsRef.current += 1;
      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
        10000
      );
      const jitter = Math.random() * 1000;
      clearReconnect();
      reconnectTimeoutRef.current = setTimeout(() => {
        openSocket();
      }, delay + jitter);
    }

    function openSocket() {
      if (cancelled) return;
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      if (isConnectingRef.current) return;

      isConnectingRef.current = true;
      clearReconnect();

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        console.log("[BlueBottleContext] connected", wsUrl);
        setIsConnected(true);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (event.data === "KeepAlive") return;
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          notifyListeners(data);

          if (data?.type === "ingame-state-update") {
            setIngameState(data.state ?? null);
            const ev = data.events;
            if (ev && typeof ev === "object" && !Array.isArray(ev)) {
              const receivedAt = Date.now();
              if (Object.prototype.hasOwnProperty.call(ev, "firstTower")) {
                appendChannelRows(setFirstTowerEvents, ev.firstTower, receivedAt);
              }
              if (Object.prototype.hasOwnProperty.call(ev, "killFeed")) {
                appendChannelRows(setKillFeedEvents, ev.killFeed, receivedAt);
              }
              if (Object.prototype.hasOwnProperty.call(ev, "objective")) {
                appendChannelRows(setObjectiveEvents, ev.objective, receivedAt);
              }
              if (Object.prototype.hasOwnProperty.call(ev, "smiteReaction")) {
                appendChannelRows(setSmiteReactionEvents, ev.smiteReaction, receivedAt);
              }
              if (Object.prototype.hasOwnProperty.call(ev, "team")) {
                appendChannelRows(setTeamEvents, ev.team, receivedAt);
              }
              if (Object.prototype.hasOwnProperty.call(ev, "playerKey")) {
                appendChannelRows(setPlayerKeyEvents, ev.playerKey, receivedAt);
              }
            }
          }
          if (data?.type === "champion-select-state-update") {
            setChampionSelectState(data.state ?? null);
          }
        } catch (err) {
          console.error("[BlueBottleContext] parse error:", err);
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        console.log("[BlueBottleContext] disconnected");
        setIsConnected(false);
        setIngameState(null);
        setFirstTowerEvents([]);
        setKillFeedEvents([]);
        setObjectiveEvents([]);
        setSmiteReactionEvents([]);
        setTeamEvents([]);
        setPlayerKeyEvents([]);
        setChampionSelectState(null);
        isConnectingRef.current = false;
        scheduleReconnect();
      };

      ws.onerror = () => {
        if (cancelled) return;
        setIsConnected(false);
        isConnectingRef.current = false;
      };
    }

    openSocket();

    return () => {
      cancelled = true;
      clearReconnect();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [wsUrl, notifyListeners]);

  const value = useMemo(
    () => ({
      isConnected,
      wsUrl,
      address,
      port,
      wsPath,
      sendMessage,
      lastMessage,
      ingameState,
      firstTowerEvents,
      killFeedEvents,
      objectiveEvents,
      smiteReactionEvents,
      teamEvents,
      playerKeyEvents,
      clearIngameEvents,
      championSelectState,
      subscribe,
    }),
    [
      isConnected,
      wsUrl,
      address,
      port,
      wsPath,
      sendMessage,
      lastMessage,
      ingameState,
      firstTowerEvents,
      killFeedEvents,
      objectiveEvents,
      smiteReactionEvents,
      teamEvents,
      playerKeyEvents,
      clearIngameEvents,
      championSelectState,
      subscribe,
    ]
  );

  useMemo(() => {
    console.log("killFeedEvents", killFeedEvents.length, killFeedEvents);
  }, [killFeedEvents.length]);

  useMemo(() => {
    console.log("objectiveEvents", objectiveEvents.length, objectiveEvents);
  }, [objectiveEvents.length]);

  useMemo(() => {
    console.log("smiteReactionEvents", smiteReactionEvents.length, smiteReactionEvents);
  }, [smiteReactionEvents.length]);

  useMemo(() => {
    console.log("teamEvents", teamEvents.length, teamEvents);
  }, [teamEvents.length]);

  useMemo(() => {
    console.log("playerKeyEvents", playerKeyEvents.length, playerKeyEvents);
  }, [playerKeyEvents.length]);

  console.log("ingameState", ingameState);

  return (
    <BlueBottleContext.Provider value={value}>
      {children}
    </BlueBottleContext.Provider>
  );
}

export function useBlueBottleContext() {
  const ctx = useContext(BlueBottleContext);
  if (!ctx) {
    throw new Error(
      'useBlueBottleContext must be used within <BlueBottleProvider wsPath="...">'
    );
  }
  return ctx;
}

/**
 * Runs `handler` whenever a message with `type` matches (stable via ref).
 * `handler` receives the full parsed payload.
 */
export function useBlueBottleMessage(type, handler) {
  const { subscribe } = useBlueBottleContext();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (type == null) return undefined;
    return subscribe((data) => {
      if (data?.type === type) {
        handlerRef.current(data);
      }
    });
  }, [type, subscribe]);
}
