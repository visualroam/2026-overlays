import "./a1esports.scss"
import Overlay from "../../../../Overlay"
import { useState, useEffect, useRef } from "react";

import { ReactComponent as LaneTop } from "../../../../../assets/icons/lanes/top.svg";
import { ReactComponent as LaneJungle } from "../../../../../assets/icons/lanes/jungle.svg";
import { ReactComponent as LaneMid } from "../../../../../assets/icons/lanes/mid.svg";
import { ReactComponent as LaneBot } from "../../../../../assets/icons/lanes/bot.svg";
import { ReactComponent as LaneSup } from "../../../../../assets/icons/lanes/sup.svg";

import A1eSportsBg from "../../../../../assets/a1esports/background_fullhd-min.jpg";
import LOGBg from "../../../../../assets/a1esports/bg_2.jpg";
import Boy from "../../../../../assets/players/3.png";
import A1eSportsLogo from "../../../../../assets/a1esports/a1drake.png";
import LOG from "../../../../../assets/a1esports/log.png";
import { getMatchData } from "../../../../../utils/match";
import { getBlueBottleAddress } from "../../../../../utils/server_address";

const PORT = 58869;
const CURRENT_PATCH = "15.11";

export const A1eSportsPickBan = ({ state, integration }) => {
  const index = integration?.leagueOfLegends?.pickban?.index;
  let debug = false;
  if (index && index > 0) {
    debug = true;
  }

  let pickState = debug ? integration?.leagueOfLegends?.pickban?.state?.state : state;

  const phase = getTournamentPhase(pickState);

  if (state?.timer) {
    if (pickState) pickState.timer = state.timer;
  }


  //console.log("Pick State", integration?.leagueOfLegends?.pickban?.show);

  return <Overlay>
    <div className="pick-and-ban-container a1esports" style={{
      "--blueSide": "#318CE7",
      "--blueSide-graph-1": "#318CE722",
      "--blueSide-graph-2": "#318CE7dd",
      "--redSide": "#d90718",
      "--redSide-graph-1": "#d9071822",
      "--redSide-graph-2": "#d90718dd",
      "--primary": "#f2cb57",
      "--generalBackground": "#111",
      "--timerStroke": "#ffffff33"
    }}>
      <div className={`pick-and-ban-bg phase-${phase} ${integration?.leagueOfLegends?.pickban?.show == "show" ? "active" : ""}`}>
        <TournamentMiddle state={pickState} integration={integration} phase={phase} />
        <TournamentBlueSide state={pickState} integration={integration} phase={phase} />
        <TournamentRedSide state={pickState} integration={integration} phase={phase} />
        <img src={LOGBg} className="bg" alt={"background"} />
        <TournamentTimer state={pickState} integration={integration} phase={phase} />
        <TournamentBansBlue state={pickState} integration={integration} phase={phase} />
        <TournamentBansRed state={pickState} integration={integration} phase={phase} />
        <FearlessBans state={pickState} integration={integration} phase={phase} />
        <div className="left"></div>
        <div className="right"></div>
        <div className="top"></div>
        <div className="bottom"></div>
      </div>
    </div>
  </Overlay>
}

const FearlessBans = ({ state, integration, phase }) => {
  const blueFearlessBans = state?.blueTeam?.fearlessBans || [];
  const redFearlessBans = state?.redTeam?.fearlessBans || [];
  const matchData = getMatchData();
  const showFearless = matchData?.showFearless;

  if (!showFearless) {
    return null;
  }
  //console.log("Fearless Bans", blueFearlessBans, redFearlessBans);

  return <div className={"fearless-bans " + (integration?.leagueOfLegends?.pickban?.show == "show" ? "active" : "")}>
    <div className="fearless-bans-blue"></div>
    <div className="fearless-bans-red"></div>
    <div className="series-bans">Series - Bans</div>
    <FearlessLane bb={blueFearlessBans} rb={redFearlessBans} index={0} />
    <FearlessLane bb={blueFearlessBans} rb={redFearlessBans} index={1} />
    <FearlessLane bb={blueFearlessBans} rb={redFearlessBans} index={2} />
    <FearlessLane bb={blueFearlessBans} rb={redFearlessBans} index={3} />
    <FearlessLane bb={blueFearlessBans} rb={redFearlessBans} index={4} />
  </div>
}

const FearlessLane = ({ bb, rb, index }) => {
  let games = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  let bans = [];
  for (let game of games) {

    let bGame = bb[game];
    let rGame = rb[game];

    if (bGame) {
      bans.push(bb[game][index] || {})
    }

    if (rGame) {
      bans.push(rb[game][index] || {})
    }
  }

  let Lane = undefined;

  if (index === 0) {
    Lane = LaneTop;
  }

  if (index === 1) {
    Lane = LaneJungle;
  }

  if (index === 2) {
    Lane = LaneMid;
  }

  if (index === 3) {
    Lane = LaneBot;
  }

  if (index === 4) {
    Lane = LaneSup;
  }

  console.log("Bans", bans, index);

  return <div className={"fearless-lane " + "r" + (bans.length)}>
    <Lane className="lane" />
    {bans.map((ban, i) => {
      let champion = ban.champion || undefined;
      let img = undefined;

      //console.log("Ban", ban.squareImg);

      if (ban) {
        img = getImagePath(ban.squareImg);
        img = img.replaceAll("14.24", CURRENT_PATCH);
      }

      //console.log("Ban Image", img);

      return <div key={i} className={`fearless-ban ${ban.isActive ? "active" : ""}`} style={{
        backgroundImage: `url(${img})`
      }}>
        <div className="ban-icon"></div>
      </div>
    })}
  </div>
}

const getTournamentPhase = (state) => {
  let blue = state?.blueTeam || {};
  let red = state?.redTeam || {};
  let blueBans = blue?.bans || [];
  let redBans = red?.bans || [];

  const combined = [...blueBans.slice(0, 3), ...redBans.slice(0, 3)];
  const hasActive = combined.some(item => item.isActive);

  return hasActive ? 1 : 2;
}

const getTimerPhase = (state) => {
  let phase = state?.timer?.phaseName || 1;

  if (phase == 1 || phase == 3) {
    return "BAN PHASE";
  }

  if (phase == 2 || phase == 4) {
    return "PICK PHASE";
  }

  if (phase == 5) {
    return "END PHASE";
  }
}

const getTimerColor = (state) => {
  let blue = state?.blueTeam || {};
  let red = state?.redTeam || {};
  let blueBans = blue?.bans || [];
  let redBans = red?.bans || [];
  let blueSlots = blue?.slots || [];
  let redSlots = red?.slots || [];

  let blueHasActive = blueBans.some(item => item.isActive) || blueSlots.some(item => item.isActive);
  let redHasActive = redBans.some(item => item.isActive) || redSlots.some(item => item.isActive);

  if (blueHasActive) {
    return "blue";
  } else if (redHasActive) {
    return "red";
  } else {
    return "none";
  }
}

const BLUE_COACH = "A1eSports Coach";
const RED_COACH = "AEF Coach";

const TournamentMiddle = ({ state, integration, phase }) => {
  let blueTeam = state?.blueTeam || {};
  let redTeam = state?.redTeam || {};

  let matchData = getMatchData();

  let mainLogo = A1eSportsLogo;
  let blueTag = matchData?.team1?.tag || "-";
  let redTag = matchData?.team2?.tag || "-";
  let blueTeamName = matchData?.team1?.name || "-";
  let redTeamName = matchData?.team2?.name || "-";

  let blueLogo = matchData?.team1?.image || A1eSportsLogo;
  let redLogo = matchData?.team2?.image || A1eSportsLogo;

  let timer = Math.round(state?.timer?.timeRemaining || 0);
  let timerColor = getTimerColor(state);

  //console.log(timer, state);

  let patch = matchData?.patch || "15.7";
  let bestOfText = "ONE";
  let bestOf = matchData?.bestOf || 1;
  let scoreBlue = matchData?.team1?.score || 0;
  let scoreRed = matchData?.team2?.score || 0;
  let count = 1;
  if (bestOf === 1) {
    bestOfText = "ONE";
    count = 1;
  }
  if (bestOf === 3) {
    bestOfText = "THREE";
    count = 2;
  }
  if (bestOf === 5) {
    bestOfText = "FIVE";
    count = 3;
  }

  return <div className={`middle phase-${phase} ${timerColor}`}>
    <div className="best-of">
      <div className="best-of-text">BEST OF</div>
      <div className="best-of-value">{bestOfText}</div>
    </div>

    <div class="best-of-score blue">
      {count > 0 && <span className={`count ${scoreBlue > 0 && "active"}`}>1</span>}
      {count > 1 && <span className={`count ${scoreBlue > 1 && "active"}`}>2</span>}
      {count > 2 && <span className={`count ${scoreBlue > 2 && "active"}`}>3</span>}
    </div>

    <div class="best-of-score red">
      {count > 0 && <span className={`count ${scoreRed > 0 && "active"}`}>1</span>}
      {count > 1 && <span className={`count ${scoreRed > 1 && "active"}`}>2</span>}
      {count > 2 && <span className={`count ${scoreRed > 2 && "active"}`}>3</span>}
    </div>

    <div className="team-name blue">{blueTeamName}</div>
    <img src={blueLogo} class="team-logo blue" alt={"blueLogo"} />
    <div className="team-tag blue">{blueTag}</div>
    <img src={LOG} className="main-logo d-none" alt={"mainLogo"} />
    <div className="team-tag red">{redTag}</div>
    <img src={redLogo} class="team-logo red" alt={"redLogo"} />
    <div className="team-name red ">{redTeamName}</div>

    <div className="patch">
      <div className="patch-value">{patch}</div>
      <div className="patch-text">PATCH</div>
    </div>
  </div>
}
const TournamentBlueSide = ({ state, integration, phase }) => {
  let slots = state?.blueTeam?.slots || [];

  return <div className={`blue-side phase-${phase} players`}>
    {slots.map((slot, index) => {
      return <Player key={index} slot={slot} state={state} side="blue" index={index} />
    })}
  </div>
}
const TournamentRedSide = ({ state, integration, phase }) => {
  let slots = state?.redTeam?.slots || [];

  return <div className={`red-side phase-${phase} players`}>
    {slots.map((slot, index) => {
      return <Player key={index} slot={slot} state={state} side="red" index={index} />
    })}
  </div>
}

const Player = ({ slot, state, side, index }) => {
  const [stats, setStats] = useState(undefined);
  const [show, setShow] = useState(true);

  let p = undefined;
  let matchData = getMatchData();
  let players = [];
  let images = [];

  if (side === "blue") {
    p = state?.blueTeam?.metaData?.members[index];
    players = matchData?.team1?.players || [];
    images = matchData?.team1?.images || [];
  } else {
    p = state?.redTeam?.metaData?.members[index];
    players = matchData?.team2?.players || [];
    images = matchData?.team2?.images || [];
  }

  let name = players[index] || p?.alias || "Player " + (index + 1);
  let icon = undefined;
  let playerImage = images[index] || Boy;

  switch (index) {
    case 0:
      icon = <LaneBot className={`lane ${side}`} />;
      break;
    case 1:
      icon = <LaneJungle className={`lane ${side}`} />;
      break;
    case 2:
      icon = <LaneMid className={`lane ${side}`} />;
      break;
    case 3:
      icon = <LaneTop className={`lane ${side}`} />;
      break;
    case 4:
      icon = <LaneSup className={`lane ${side}`} />;
      break;
  }

  let champion = slot?.champion || undefined;
  let img = champion ? getImagePath(champion.splashCenteredImg).replaceAll("14.24", CURRENT_PATCH) : undefined;

  const championName = champion?.name || "Unknown Champion";

  useEffect(() => {
    // Prevent running this effect again on hot reload

    if (!champion || slot.isActive) {
      setShow(false);
      alreadyRan.current = false; // Reset the alreadyRan flag if champion is not defined or slot is active
      return;
    }

    if (alreadyRan.current) return;
    alreadyRan.current = true;

    setShow(true);
    console.log("Fetching stats for", championName, "in slot", slot.isActive, show);

    setStats({});
    setTimeout(() => {
      setShow(false);
      console.log("Hiding stats for", championName, "in slot", slot.isActive, show);
    }, 7000);
  }, [champion?.name, slot.isActive]);

  // Define this outside of `useEffect`
  const alreadyRan = useRef(false);

  let showStats = !slot.isActive && champion;

  let games = stats?.games || 0;
  let gamesForPickBan = games + 1;
  let championStats = stats?.[championName] || {};
  let wins = championStats?.wins || 0;
  let losses = championStats?.losses || 0;
  let bans = championStats?.bans || 0;
  let picks = (championStats?.picks || 0) + 1;
  let winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  let pickBanRate = ((bans + picks) / gamesForPickBan * 100).toFixed(1);
  let pickRate = (picks / gamesForPickBan * 100).toFixed(1);

  return (
    <div className={`player ${(slot.isActive || show)? "active" : ""} ${show ? "show-stats" : ""} ${side} i${index + 1}`}>
      {icon}
      {showStats && (
        <div className="player-stats">
          <div className="player-stat-champion-name">{championName}</div>
          <div className="player-stat-value r1">{pickBanRate}%</div>
          <div className="player-stat-label r1">Pick/Ban</div>
          <div className="player-stat-value r2">{pickRate}%</div>
          <div className="player-stat-label r2">Pick</div>
          <div className="player-stat-value r3">{winRate}%</div>
          <div className="player-stat-label r3">Win</div>
          <div className="player-stat-value r4">{wins}W - {losses}L</div>
        </div>
      )}
      <div className="player-name">{name}</div>
      {slot.isActive && <div className="player-active"></div>}
      <img src={playerImage} className="player-image" alt="player" />
      <div className="bg-champion" style={{ backgroundImage: `url(${img})` }}></div>
    </div>
  );
};
const TournamentTimer = ({ state, integration, phase }) => {
  let timer = state?.timer?.timeRemaining || 0;
  let max = state?.timer?.phaseDuration || 60;
  let width = (timer / max) * 100;
  let color = getTimerColor(state);

  return <div className={"timer-bar " + color}>
    <div className={"inner-timer-bar " + color} style={{
      width: `${width}%`
    }}></div>
  </div>
}
const TournamentBansBlue = ({ state, integration, phase }) => {
  let bans = state?.blueTeam?.bans || [];
  let matchData = getMatchData();
  let coach = matchData?.team1?.coach || BLUE_COACH;
  let showCoach = matchData?.showCoach;

  while (bans.length < 5) {
    bans.push({});
  }

  return <div className="bn-blue">
    {showCoach && <div className="bans-blue-coach">
      <div className="coach">COACH</div>
      <div className="bans-blue-coach-name">{coach}</div>
    </div>}
    <div className={"bans-blue " + (!showCoach && "no-coach")}>
      {bans.map((ban, index) => {
        let champion = ban.champion || undefined;
        let img = undefined;

        if (champion) {
          img = getImagePath(champion.squareImg);
          img = img.replaceAll("14.24", CURRENT_PATCH);
        }


        return <div key={index} className={`ban ${ban.isActive ? "active" : ""} i${index + 1} ${ban.champion ? "no-color" : ""}`} style={{
          backgroundImage: `url(${img})`
        }}>
          <div className="ban-icon"></div>
        </div>
      })}
    </div>
  </div>
}
const TournamentBansRed = ({ state, integration, phase }) => {
  let bans = state?.redTeam?.bans || [];
  let matchData = getMatchData();
  let coach = matchData?.team2?.coach || RED_COACH;
  let showCoach = matchData?.showCoach;

  while (bans.length < 5) {
    bans.push({});
  }

  return <div className="bn-red">
    {showCoach && <div className="bans-red-coach">
      <div className="coach">COACH</div>
      <div className="bans-red-coach-name">{coach}</div>
    </div>}
    <div className={"bans-red " + (!showCoach && "no-coach")}>
      {bans.map((ban, index) => {
        let champion = ban.champion || undefined;
        let img = null;

        if (champion) {
          //console.log(champion);
          img = getImagePath(champion.squareImg);
          img = img.replaceAll("14.24", CURRENT_PATCH);
        }


        return <div key={index} className={`ban ${ban.isActive ? "active" : ""} i${index + 1}`} style={{
          backgroundImage: `url(${img})`
        }}>
          <div className="ban-icon"></div>
        </div>
      })}
    </div>
  </div>
}

const getImagePath = (path) => {
  const { hostname } = window.location;
  const address = getBlueBottleAddress();
  if (!path) return null;
  if (address && address != hostname) {
    return `http://${address}:58869/${path}`;
  }

  return `http://${hostname}:58869/${path}`;
}
