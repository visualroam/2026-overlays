import React from "react";
import { Player } from "../../lhm-rl-module";
import HexPattern from "../HexPattern";

import "./ObservedPlayerBox.scss";

interface Props {
  player?: Player;
  show: boolean;
  steamids: string[];
}

const ObservedPlayerBox = (props: Props) => {
  const { player, show } = props;
  if (!player) return null;

  const boost = Math.max(0, Math.min(100, player.boost || 0));
  const speed = Math.max(0, Math.min(150, Math.round(player.speed || 0)));
  const speedAngle = (speed / 150) * 360;
  const side = player.team === 0 ? "blue" : "orange";

  const stats = [
    { value: player.goals, icon: "fal fa-bullseye", label: "G" },
    { value: player.assists, icon: "fal fa-hands-helping", label: "A" },
    { value: player.saves, icon: "fal fa-shield-alt", label: "S" },
    { value: player.shots, icon: "fal fa-futbol", label: "Sh" },
    { value: player.demos, icon: "fal fa-bomb", label: "D" },
  ];

  return (
    <div className={`observed ${side} ${show ? "show" : "hide"}`}>
      <div className="observed-bg" />

      <div
        className="speed"
        style={{ ["--angle" as any]: `${speedAngle}deg` }}
      >
        <div className="speed-ring" />
        <div className="speed-inner">
          <span className="speed-num">{speed}</span>
          <span className="speed-unit">KPH</span>
        </div>
      </div>

      <div className="observed-content">
        <div className="observed-top">
          <div className="stats">
            {stats.map((stat, idx) => (
              <div className="stat" key={idx}>
                <i className={stat.icon} />
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="observed-bottom">
          <div className="boost-fill" style={{ width: `${boost}%` }}>
            <HexPattern
              size={14}
              gap={2}
              strokeWidth={1}
              strokeColor="rgba(255,255,255,0.6)"
              opacity={0.45}
              className="hex"
            />
          </div>

          <div className="boost-icon">
            <i className="fal fa-bolt" />
          </div>
          <div className="boost-value">{boost}</div>
          <div className="player-name">{player.name}</div>
        </div>
      </div>
    </div>
  );
};

export default ObservedPlayerBox;
