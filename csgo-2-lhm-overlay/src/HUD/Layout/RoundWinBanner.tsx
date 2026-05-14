import type { Score, Team } from "csgogsi";
import { useRef, useState } from "react";
import { onGSI } from "../../API/contexts/actions";
import "./round-win-banner.scss";

interface BannerState {
  team: Team;
  id: number;
}

const RoundWinBanner = () => {
  const [banner, setBanner] = useState<BannerState | null>(null);
  const idRef = useRef(0);

  onGSI(
    "roundEnd",
    (result: Score) => {
      if (result.map.phase === "warmup") return;
      idRef.current += 1;
      setBanner({ team: result.winner, id: idRef.current });
    },
    []
  );

  if (!banner) return null;

  return (
    <div
      key={banner.id}
      className={`round-win-banner ${banner.team.side} round-win-banner--visible`}
      role="status"
      aria-live="polite"
      onAnimationEnd={() => setBanner(null)}
    >
      <div className="round-win-banner__inner">
        <span className="round-win-banner__team">{banner.team.name}</span>
        <span className="round-win-banner__tagline">WINS THE ROUND</span>
      </div>
    </div>
  );
};

export default RoundWinBanner;
