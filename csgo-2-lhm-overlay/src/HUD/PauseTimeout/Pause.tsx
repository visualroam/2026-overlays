import { CSGO } from "csgogsi";
import "./pause-timeout.scss";

interface IProps {
  phase: CSGO["phase_countdowns"] | null;
}

const Pause = ({ phase }: IProps) => {
  const show = phase?.phase === "paused";
  return (
    <div className={`pause-timeout-overlay ${show ? "show" : ""} technical`}>
      <div className="pause-timeout-overlay-container">
        <div className="pause-timeout-overlay-title">TECHNICAL PAUSE</div>
        <div className="pause-timeout-overlay-name">TIME PAUSED</div>
      </div>
    </div>
  );
};

export default Pause;
