import { useEffect, useRef, useState } from "react";
import { CSGO } from "csgogsi";
import "./players.scss";

interface Props {
  game: CSGO;
}

const MAX_ALIVE = 5;
const PEEK_MS = 5000;

function RollingDigit({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(MAX_ALIVE, value));
  return (
    <span className="rolling-digit">
      <span
        className="rolling-digit-track"
        style={{ transform: `translateY(calc(-${clamped} * 1em))` }}
      >
        {Array.from({ length: MAX_ALIVE + 1 }, (_, n) => (
          <span className="rolling-digit-cell" key={n}>
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

const PlayersAlive = ({ game }: Props) => {
  const players = game.players || [];
  const phase = game.phase_countdowns.phase;
  const isBombPhase =
    game.round?.bomb === "planted" ||
    phase === "bomb" ||
    game.bomb?.state === "planted" ||
    game.bomb?.state === "defusing";
  const isLivePhase =
    (game.round?.phase === "live" || phase === "live") && !isBombPhase;
  const activePhase = isLivePhase || isBombPhase;

  const ctAlive = players.filter(
    (p) => p.team.side === "CT" && p.state.health > 0
  ).length;
  const tAlive = players.filter(
    (p) => p.team.side === "T" && p.state.health > 0
  ).length;

  const [peek, setPeek] = useState(false);
  const prevRef = useRef<{ ct: number; t: number } | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activePhase) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setPeek(false);
      prevRef.current = { ct: ctAlive, t: tAlive };
      return;
    }

    const prev = prevRef.current;
    if (prev === null) {
      prevRef.current = { ct: ctAlive, t: tAlive };
      return;
    }

    const changed = prev.ct !== ctAlive || prev.t !== tAlive;
    prevRef.current = { ct: ctAlive, t: tAlive };
    if (!changed) return;

    setPeek(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setPeek(false);
      hideTimerRef.current = null;
    }, PEEK_MS);
  }, [activePhase, ctAlive, tAlive]);

  return (
    <div
      className={`players_alive${peek ? " players_alive--peek" : ""}`}
      aria-live="polite"
      aria-hidden={!peek}
    >

      <div className="counter_container">
        <div className="CT team_counter">
          <RollingDigit value={ctAlive} />
        </div>
        <div className="separator"></div>
        <div className="title_container">Spieler lebend</div>
        <div className="separator"></div>
        <div className="T team_counter">
          <RollingDigit value={tAlive} />
        </div>
      </div>
    </div>
  );
};

export default PlayersAlive;
