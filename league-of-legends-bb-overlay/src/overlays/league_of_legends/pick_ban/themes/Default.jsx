import "./Default.scss"
import Overlay from "../../../Overlay"

import { ReactComponent as LaneTop } from "../../../../assets/icons/lanes/top.svg";
import { ReactComponent as LaneJungle } from "../../../../assets/icons/lanes/jungle.svg";
import { ReactComponent as LaneMid } from "../../../../assets/icons/lanes/mid.svg";
import { ReactComponent as LaneBot } from "../../../../assets/icons/lanes/bot.svg";
import { ReactComponent as LaneSup } from "../../../../assets/icons/lanes/sup.svg";

const PORT = 58869;

export const PickAndBanDefaultTheme = ({state, integration}) => {
  const mode = "tournament"

  if(mode == "tournament") {
    return <TournamentMode state={state} integration={integration} />
  }

  return <Overlay>
    <div className="pick-and-ban-container default">
      <div className="pick-and-ban-bg">

      </div>
    </div>
  </Overlay>
}

const TournamentMode = ({state, integration}) => {
  const index = integration?.leagueOfLegends?.pickban?.index;
  let debug = false;
  if(index && index > 0) {
    debug = true;
  }

  let pickState = debug ? integration?.leagueOfLegends?.pickban?.state?.state : state;
  console.log(state);
  const phase = getTournamentPhase(pickState);

  if(state?.timer) {
    if(pickState) pickState.timer = state.timer;
  }

  return <Overlay>
    <div className="pick-and-ban-container default" style={{
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
      <div className={`pick-and-ban-bg phase-${phase}`}>
        <TournamentMiddle state={pickState} integration={integration} phase={phase} />
        <TournamentBlueSide state={pickState} integration={integration} phase={phase} />
        <TournamentRedSide state={pickState} integration={integration} phase={phase} />
        <TournamentTimer state={pickState} integration={integration} phase={phase} />
        <TournamentBansBlue state={pickState} integration={integration} phase={phase} />
        <TournamentBansRed state={pickState} integration={integration} phase={phase} />
      </div>
    </div>
  </Overlay>
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

  if(phase == 1 || phase == 3) {
    return "BAN PHASE";
  }

  if(phase == 2 || phase == 4) {
    return "PICK PHASE";
  }

  if(phase == 5) {
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

const TournamentMiddle = ({state, integration, phase}) => {
  let blueTeam = state?.blueTeam || {};
  let redTeam = state?.redTeam || {};

  let mainLogo = getImagePath("cache/style/mainIcon.png")
  let blueTag = blueTeam?.metaData?.tag || "BLUE";
  let redTag = redTeam?.metaData?.tag || "RED";
  let blueTeamName = blueTeam?.metaData?.name || "TEAM NAME";
  let redTeamName = redTeam?.metaData?.name || "TEAM NAME";
  let blueLogo = blueTeam?.metaData?.iconUri || "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Esports_organization_Fnatic_logo.svg/450px-Esports_organization_Fnatic_logo.svg.png?20200815054317";
  let redLogo = redTeam?.metaData?.iconUri || "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Esports_organization_Fnatic_logo.svg/450px-Esports_organization_Fnatic_logo.svg.png?20200815054317";


  let timer = Math.round(state?.timer?.timeRemaining || 0);
  let timerColor = getTimerColor(state);
  let timerPhase = getTimerPhase(state);

  return <div className={`middle phase-${phase} ${timerColor}`}>
    <div className="team-name blue">{blueTeamName}</div>
    <img src={blueLogo} class="team-logo blue" alt={"blueLogo"} />
    <div className="team-tag blue">{blueTag}</div>
    <img src={mainLogo} className="main-logo" alt={"mainLogo"} />
    <div className="team-tag red">{redTag}</div>
    <img src={redLogo} class="team-logo red" alt={"redLogo"} />
    <div className="team-name red ">{redTeamName}</div>
  </div>
}
const TournamentBlueSide = ({state, integration, phase}) => {
  let slots = state?.blueTeam?.slots || [];

  return <div className={`blue-side phase-${phase} players`}>
    {slots.map((slot, index) => {
      return <Player key={index} slot={slot} state={state} side="blue" index={index} />
    })}
  </div>
}
const TournamentRedSide = ({state, integration, phase}) => {
  let slots = state?.redTeam?.slots || [];

  return <div className={`red-side phase-${phase} players`}>
    {slots.map((slot, index) => {
      return <Player key={index} slot={slot} state={state} side="blue" index={index} />
    })}
  </div>
}

const Player = ({slot, state, side, index}) => {
  let p = undefined;
  if(side == "blue") {
    p = state?.blueTeam?.metaData?.members[index];
  } else {
    p = state?.redTeam?.metaData?.members[index];
  }

  let icon = undefined;

  switch(index) {
    case 0:
      icon = <LaneBot className={`lane ${side}`} />
      break;
    case 1:
      icon = <LaneJungle className={`lane ${side}`} />
      break;
    case 2:
      icon = <LaneMid className={`lane ${side}`} />
      break;
    case 3:
      icon = <LaneTop className={`lane ${side}`} />
      break;
    case 4:
      icon = <LaneSup className={`lane ${side}`} />
      break;
  }

  let champion = slot?.champion || undefined;
  let img = undefined;

  console.log(champion);

  if(champion) {
    img = getImagePath(champion.splashCenteredImg);
    img = img.replaceAll("14.24", "15.6")
  }

  return <div className={`player ${slot.isActive ? "active" : ""}`}>
    {icon && icon}
    <div className="player-name">{p?.alias}</div>
    {slot.isActive && <div className="player-active"></div>}
    <div className="bg-champion" style={{
      backgroundImage: `url(${img})`
    }}></div>
  </div>
}

const TournamentTimer = ({state, integration, phase}) => {

  console.log(state?.timer);
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
const TournamentBansBlue = ({state, integration, phase}) => {
  let bans = state?.blueTeam?.bans || [];

  return <div className="bans-blue">
    {bans.map((ban, index) => {
      let champion = ban.champion || undefined;
      let img = undefined;

      if(champion) {
        console.log(champion);
        img = getImagePath(champion.squareImg);
        img = img.replaceAll("14.24", "15.2");
      }


      return <div key={index} className={`ban ${ban.isActive ? "active" : ""} i${index+1}`} style={{
        backgroundImage: `url(${img})`
      }}>
        <div className="ban-icon"></div>
      </div>
    })}
  </div>
}
const TournamentBansRed = ({state, integration, phase}) => {
  let bans = state?.redTeam?.bans || [];

  return <div className="bans-red">
    {bans.map((ban, index) => {
      let champion = ban.champion || undefined;
      let img = undefined;

      if(champion) {
        console.log(champion);
        img = getImagePath(champion.squareImg);
        img = img.replaceAll("14.24", "15.2");
      }


      return <div key={index} className={`ban ${ban.isActive ? "active" : ""} i${index+1}`} style={{
        backgroundImage: `url(${img})`
      }}>
        <div className="ban-icon"></div>
      </div>
    })}
  </div>
}

const getImagePath = (path) => {
  const { hostname } = window.location;
  return `http://${hostname}:${window.blueBottlePort || PORT}/${path}`;
}
