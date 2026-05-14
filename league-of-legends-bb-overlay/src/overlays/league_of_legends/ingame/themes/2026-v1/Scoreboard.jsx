import { useState, useEffect } from "react";
import { useBlueBottleContext } from "../../../../BlueBottle";
import { getImagePath } from "../../../../../utils/images";
import { formatTime } from "../../../../../utils/formatTime";
import { formatGold } from "../../../../../utils/formatGold";
import "./Scoreboard.scss";

export function Scoreboard() {
  const { ingameState } = useBlueBottleContext();
  const { scoreboard: scoreboardState } = ingameState ?? {};

  const [scoreboard, setScoreboard] = useState(null);

  useEffect(() => {
    if(scoreboardState !== null && scoreboardState !== undefined) {
      setScoreboard(scoreboardState);
    }
  }, [scoreboardState]);

  const showScoreboard = scoreboardState !== null && scoreboardState !== undefined;

  if(scoreboard === null) return null;

  const { teams } = scoreboard ?? [];
  const blueTeam = teams?.[0] ?? {};
  const redTeam = teams?.[1] ?? {};
  const blueTag = blueTeam?.teamTag ?? "";
  const redTag = redTeam?.teamTag ?? "";
  const blueKills = blueTeam?.kills ?? 0;
  const redKills = redTeam?.kills ?? 0;
  const blueGold = blueTeam?.gold ?? 0;
  const redGold = redTeam?.gold ?? 0;
  const diffGold = blueGold - redGold;
  const blueSeriesWins = blueTeam?.seriesScore?.wins ?? 0;
  const redSeriesWins = redTeam?.seriesScore?.wins ?? 0;
  const blueTowers = blueTeam?.towers ?? 0;
  const redTowers = redTeam?.towers ?? 0;
  const blueTowerPlates = blueTeam?.towerPlates ?? 0;
  const redTowerPlates = redTeam?.towerPlates ?? 0;
  const blueGrubs = blueTeam?.grubs ?? 0;
  const redGrubs = redTeam?.grubs ?? 0;
  const blueDragons = blueTeam?.dragons ?? [];
  const redDragons = redTeam?.dragons ?? [];
  const blueLogoPath = blueTeam?.teamIconUrl ?? "";
  const redLogoPath = redTeam?.teamIconUrl ?? "";
  const blueLogo = getImagePath(blueLogoPath);
  const redLogo = getImagePath(redLogoPath);
  const bestOf = scoreboard?.bestOf ?? 1;
  const gameTime = ingameState?.gameTime ?? 0;
  const mainImage = getImagePath(`cache/season/1/mainIcon.png`);

  return <div className={`scoreboard ${showScoreboard ? "show" : "hide"}`}>
    <div className="scoreboard-top">
      <SeriesScore games={bestOf} wins={blueSeriesWins} side="blue" />
      <img src={blueLogo} alt={blueTag} className="team-logo blue" />
      <div className="team-tag blue">{blueTag}</div>
      <TeamGold gold={blueGold} diff={diffGold} side="blue" />
      <TeamTowers towers={blueTowers} plates={blueTowerPlates} side="blue" />
      <div className="score">
        <div className="kills blue">{blueKills}</div>
        <div className="tournament-logo">
          <img src={mainImage} />
        </div>
        <div className="kills red">{redKills}</div>
      </div>
      <TeamTowers towers={redTowers} plates={redTowerPlates} side="red" />
      <TeamGold gold={redGold} diff={diffGold * -1} side="red" />
      <div className="team-tag red">{redTag}</div>
      <img src={redLogo} alt={redTag} className="team-logo red" />
      <SeriesScore games={bestOf} wins={redSeriesWins} side="red" />
    </div>
    <div className="scoreboard-bottom">
      <Drakes drakes={blueDragons} side="blue" />
      <TeamPlatings plates={blueTowerPlates} side="blue" />
      <TeamGrubs grubs={blueGrubs} side="blue" />
      <div className="game-time">{formatTime(gameTime, "00:00")}</div>
      <TeamGrubs grubs={redGrubs} side="red" />
      <TeamPlatings plates={redTowerPlates} side="red" />
      <Drakes drakes={redDragons} side="red" />
    </div>
  </div>;
}

const Drakes = ({ drakes, side }) => {
  return <div className={`drakes ${side}`}>
    {drakes.map((drake) => {
      return <div className="drake"><img src={getImagePath(`cache/style/ingame/objectives/dragonpit/${drake}.png`)} /></div>;
    })}
  </div>;
};

const SeriesScore = ({ games, wins, side }) => {
  let gamesArray = Array.from({ length: games - 1 }, (_, index) => index + 1);
  console.log(gamesArray);

  return <div className={`series-score ${side}`}>
    {gamesArray.map((game) => {
      let won = game <= wins;
      return <div className={`game ${won && "won"}`}></div>;
    })}
  </div>;
};

const TeamGold = ({ gold, diff, side }) => {
  const image = getImagePath(`cache/style/ingame/scoreboard/gold.png`);

  return <div className={`team-gold ${side}`}>
    <div className="gold-icon"><img src={image} /></div>
    <div className="gold-text">{formatGold(gold)}k</div>
    {diff > 100 && <div className="gold-diff">+{formatGold(diff)}k</div>}
  </div>;
};

const TeamTowers = ({ towers, side }) => {
  const image = getImagePath(`cache/style/ingame/scoreboard/tower.png`);

  return <div className={`team-towers ${side}`}>
    <div className="towers-icon"><img src={image} /></div>
    <div className="towers-text">{towers}</div>
  </div>;
};

const TeamPlatings = ({ plates, side }) => {
  const image = getImagePath(`cache/style/ingame/scoreboard/towerPlate.png`);
  return <div className={`team-platings ${side}`}>
    <div className="platings-icon"><img src={image} /></div>
    <div className="platings-text">{plates}</div>
  </div>;
};

const TeamGrubs = ({ grubs, side }) => {
  const image = getImagePath(`cache/style/ingame/objectives/baronpit/grubs.png`);

  return <div className={`team-grubs ${side}`}>
    <div className="grubs-icon"><img src={image} /></div>
    <div className="grubs-text">{grubs}</div>
  </div>;
};
