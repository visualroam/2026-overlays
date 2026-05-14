import React from "react";
import { apiUrl } from "../../api/api";
import "./TopBox.scss";

interface Props {
  time?: number;
  blueScore?: number;
  orangeScore?: number;
  label?: string;
  blueTeamName?: string;
  orangeTeamName?: string;
  blueTeamId?: number;
  orangeTeamId?: number;
  isOvertime?: boolean;
  blueMatchScore?: number;
  orangeMatchScore?: number;
  blueTeamTag?: string;
  orangeTeamTag?: string;
}

const labelToMax = (label?: string) => {
  switch ((label || "").toLowerCase()) {
    case "bo1":
      return 0;
    case "bo2":
      return 1;
    case "bo3":
      return 2;
    case "bo5":
      return 3;
    case "bo7":
      return 4;
    case "bo9":
      return 5;
    default:
      return 0;
  }
};

const SeriesDots = ({
  side,
  wins,
  max,
}: {
  side: "blue" | "orange";
  wins: number;
  max: number;
}) => {
  if (!max) return null;
  return (
    <div className={`series-wins ${side}`}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`wins-box ${i < wins ? "win" : "empty"} ${side}`}
        />
      ))}
    </div>
  );
};

const TopBox = (props: Props) => {
  const {
    time,
    blueScore,
    orangeScore,
    label,
    blueTeamName,
    orangeTeamName,
    blueTeamId,
    orangeTeamId,
    blueTeamTag,
    orangeTeamTag,
    blueMatchScore,
    orangeMatchScore,
    isOvertime,
  } = props;

  const minutes = time ? Math.floor(time / 60) % 60 : 0;
  const seconds = time ? Math.floor(time) % 60 : 0;
  const timeStr = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  const max = labelToMax(label);

  const blueLogo =
    blueTeamId !== undefined ? `${apiUrl}api/teams/logo/${blueTeamId}` : null;
  const orangeLogo =
    orangeTeamId !== undefined
      ? `${apiUrl}api/teams/logo/${orangeTeamId}`
      : null;

  const trimmedLabel =
    label && label.length > 14 ? `${label.slice(0, 14)}…` : label;

  return (
    <div className="matchbar-container">
      <div className="matchbar-inner-top">
        <div className="team blue">
          <div className="logo">
            {blueLogo ? (
              <img src={blueLogo} alt={blueTeamName || "blue team logo"} />
            ) : null}
          </div>
          <div className="team-name">
            {blueTeamTag || blueTeamName || "Team 1"}
          </div>
        </div>

        <div className="timer">
          <div className="score blue">{blueScore ?? 0}</div>
          <div className={`time ${isOvertime ? "overtime" : ""}`}>{timeStr}</div>
          <div className="round">
            {isOvertime ? "OVERTIME" : trimmedLabel || "GAME"}
          </div>
          <div className="score orange">{orangeScore ?? 0}</div>
        </div>

        <div className="team orange">
          <div className="team-name">
            {orangeTeamTag || orangeTeamName || "Team 2"}
          </div>
          <div className="logo">
            {orangeLogo ? (
              <img src={orangeLogo} alt={orangeTeamName || "orange team logo"} />
            ) : null}
          </div>
        </div>
      </div>

      {max > 0 && (
        <div className="matchbar-inner-bottom">
          <SeriesDots side="blue" wins={blueMatchScore || 0} max={max} />
          <div className="bo-label">{(label || "").toUpperCase()}</div>
          <SeriesDots side="orange" wins={orangeMatchScore || 0} max={max} />
        </div>
      )}
    </div>
  );
};

export default TopBox;
