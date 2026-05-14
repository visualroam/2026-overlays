import React from "react";
import { Player } from "../../lhm-rl-module/interfaces";
import { avatars } from "../../api/avatars";
import { apiUrl } from "../../api/api";
import HexPattern from "../HexPattern";

import "./Scoreboard.scss";
import A1Boy from "../../3.png";

interface TeamInfo {
  name?: string;
  id?: number;
  map_score?: number;
}

interface Props {
  players: Player[];
  teams?: { blue?: TeamInfo; orange?: TeamInfo };
  gameScore?: { blue: number; orange: number };
  bestOf?: string;
  isOvertime?: boolean;
}

const rankedPlayers = (players: Player[], team: 0 | 1) =>
  players
    .filter((p) => p.team === team)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 3);

const PlayerRow = ({
  player,
  side,
  rank,
}: {
  player: Player;
  side: "blue" | "orange";
  rank: number;
}) => {
  const avatar = player.steamid ? avatars[player.steamid]?.url : A1Boy;
  const isMvp = rank === 0;

  return (
    <div className={`player-card ${side} delay-${rank} ${isMvp ? "mvp" : ""}`}>
      <div className="rank-block">
        <div className="rank-number">{rank + 1}</div>
        {isMvp && <div className="rank-label">MVP</div>}
      </div>

      <div
        className="avatar"
        style={{ backgroundImage: `url('${avatar || A1Boy}')` }}
      />

      <div className="info">
        <div className="name">{player.name}</div>
        <div className="stats">
          <div className="stat" title="Goals">
            <i className="fal fa-bullseye" />
            <span>{player.goals}</span>
          </div>
          <div className="stat" title="Assists">
            <i className="fal fa-hands-helping" />
            <span>{player.assists}</span>
          </div>
          <div className="stat" title="Saves">
            <i className="fal fa-shield-alt" />
            <span>{player.saves}</span>
          </div>
          <div className="stat" title="Shots">
            <i className="fal fa-futbol" />
            <span>{player.shots}</span>
          </div>
          <div className="stat" title="Demos">
            <i className="fal fa-bomb" />
            <span>{player.demos}</span>
          </div>
        </div>
      </div>

      <div className="score">
        <div className="score-value">{player.score || 0}</div>
        <div className="score-label">SCORE</div>
      </div>
    </div>
  );
};

const Scoreboard = (props: Props) => {
  if (!props.players) return null;

  const blue = rankedPlayers(props.players, 0);
  const orange = rankedPlayers(props.players, 1);

  const blueScore = props.gameScore?.blue ?? 0;
  const orangeScore = props.gameScore?.orange ?? 0;
  const blueName = props.teams?.blue?.name || "BLUE";
  const orangeName = props.teams?.orange?.name || "ORANGE";
  const blueLogo =
    props.teams?.blue?.id !== undefined
      ? `${apiUrl}api/teams/logo/${props.teams.blue.id}`
      : null;
  const orangeLogo =
    props.teams?.orange?.id !== undefined
      ? `${apiUrl}api/teams/logo/${props.teams.orange.id}`
      : null;

  const blueWon = blueScore > orangeScore;
  const orangeWon = orangeScore > blueScore;
  const statusLabel = props.isOvertime ? "OVERTIME RESULT" : "FINAL SCORE";

  return (
    <>
      <div className="scoreboard-backdrop">
        <HexPattern
          size={32}
          gap={4}
          strokeWidth={1}
          strokeColor="rgba(255,255,255,0.05)"
          opacity={1}
          className="scoreboard-backdrop__hex"
        />
      </div>

      <div className="scoreboard">
        <div className="scoreboard-hero">
          <div className="scoreboard-hero__label">{statusLabel}</div>

          <div className="scoreboard-hero__teams">
            <div className={`hero-team blue ${blueWon ? "won" : ""}`}>
              <div className="hero-team__name">{blueName}</div>
              <div className="hero-team__logo">
                {blueLogo ? (
                  <img src={blueLogo} alt={blueName} />
                ) : (
                  <i className="fal fa-shield" />
                )}
              </div>
            </div>

            <div className="hero-score">
              <div className={`hero-score__num blue ${blueWon ? "won" : ""}`}>
                {blueScore}
              </div>
              <div className="hero-score__sep">–</div>
              <div
                className={`hero-score__num orange ${orangeWon ? "won" : ""}`}
              >
                {orangeScore}
              </div>
            </div>

            <div className={`hero-team orange ${orangeWon ? "won" : ""}`}>
              <div className="hero-team__logo">
                {orangeLogo ? (
                  <img src={orangeLogo} alt={orangeName} />
                ) : (
                  <i className="fal fa-shield" />
                )}
              </div>
              <div className="hero-team__name">{orangeName}</div>
            </div>
          </div>
        </div>

        <div className="results">
          <div className="result-column blue">
            {blue.map((p, i) => (
              <PlayerRow
                key={p.id || i}
                player={p}
                side="blue"
                rank={i}
              />
            ))}
          </div>

          <div className="result-column orange">
            {orange.map((p, i) => (
              <PlayerRow
                key={p.id || i}
                player={p}
                side="orange"
                rank={i}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Scoreboard;
