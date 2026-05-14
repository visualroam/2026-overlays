import { MAX_TIMER, useBombTimer } from "./Countdown";
import { BombNew } from "./../../assets/Icons";
import { useConfig } from "../../API/contexts/actions";

const parseUrgentSeconds = (raw: string | undefined): number => {
  const n = Number(raw ?? "10");
  return Number.isFinite(n) && n > 0 ? n : 10;
};

const Bomb = () => {
  const bombData = useBombTimer();
  const timerSettings = useConfig("timer_settings");
  const show = bombData.state === "planted" || bombData.state === "defusing";

  const t = bombData.bombTime;
  const urgentSec = parseUrgentSeconds(timerSettings?.urgent_threshold);
  const half = urgentSec * 0.5;
  const pulse = timerSettings?.bomb_pulse !== false;

  let urgency: "normal" | "warn" | "critical" = "normal";
  if (show && t > 0) {
    if (t <= half) urgency = "critical";
    else if (t <= urgentSec) urgency = "warn";
  }

  const pulseClass =
    show && pulse && urgency !== "normal" ? " bomb-timer--pulse" : "";

  return (
    <div
      className={`bomb-timer bomb-urgency-${urgency}${pulseClass}`}
      data-bomb-seconds={show ? Math.ceil(t) : undefined}
    >
      <div
        className={`bomb-timer-inner ${show ? "show" : "hide"}`}
      >
        <div className="bomb-timer-inner-progress" style={{ width: `${(t * 100) / MAX_TIMER.bomb}%` }} />
      </div>
      <div className={`bomb-icon ${show ? "show" : "hide"}`}>
        <BombNew />
      </div>
    </div>
  );
};

export default Bomb;
