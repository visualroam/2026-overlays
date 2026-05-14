import { Map, CSGO } from "csgogsi";
import "./pause-timeout.scss";

interface IProps {
  phase: CSGO["phase_countdowns"] | null;
  map: Map;
}

const Timeout = ({ phase, map }: IProps) => {
  const isTimeout =
    phase?.phase === "timeout_t" || phase?.phase === "timeout_ct";
  const side =
    phase?.phase === "timeout_t"
      ? "t"
      : phase?.phase === "timeout_ct"
        ? "ct"
        : "";

  const team =
    phase?.phase === "timeout_t"
      ? map.team_t
      : phase?.phase === "timeout_ct"
        ? map.team_ct
        : map.team_ct;

  const secondsRaw = phase ? Number(phase.phase_ends_in) : 0;
  const seconds = Number.isFinite(secondsRaw)
    ? Math.max(0, Math.ceil(Math.abs(secondsRaw)))
    : 0;

  const show = isTimeout && seconds > 0;

  const rootClass = [
    "pause-timeout-overlay",
    "pause-timeout-overlay--tactical",
    side && `pause-timeout-overlay--${side}`,
    show ? "pause-timeout-overlay--visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sideLabel = side === "ct" ? "CT" : side === "t" ? "T" : "";

  return (
    <div className={`pause-timeout-overlay ${show ? "show" : ""} ${side}`}>
      <div className="pause-timeout-overlay-container">
        <div className="pause-timeout-overlay-title">TACTICAL TIMEOUT</div>
        <div className="pause-timeout-overlay-name">{team.name}</div>
      </div>
      <div className="separator"></div>
      <div className="pause-timeout-overlay-timer">
        {show ? seconds : ""}
      </div>
    </div>
  );
};

export default Timeout;
