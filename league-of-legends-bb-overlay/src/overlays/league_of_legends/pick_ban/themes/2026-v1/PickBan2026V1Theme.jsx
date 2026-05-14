import "./PickBan2026V1Theme.scss";
import Overlay from "../../../../Overlay";
import { useBlueBottleContext } from "../../../../BlueBottleContext";
import { getMatchData } from "../../../../../utils/match";
import { getBlueBottleAddress, getBlueBottlePort } from "../../../../../utils/server_address";

import { ReactComponent as LaneTop } from "../../../../../assets/icons/lanes/top.svg";
import { ReactComponent as LaneJungle } from "../../../../../assets/icons/lanes/jungle.svg";
import { ReactComponent as LaneMid } from "../../../../../assets/icons/lanes/mid.svg";
import { ReactComponent as LaneBot } from "../../../../../assets/icons/lanes/bot.svg";
import { ReactComponent as LaneSup } from "../../../../../assets/icons/lanes/sup.svg";

const getTournamentPhase = (state) => {
  let blue = state?.blueTeam || {};
  let red = state?.redTeam || {};
  let blueBans = blue?.bans || [];
  let redBans = red?.bans || [];

  const combined = [...blueBans.slice(0, 3), ...redBans.slice(0, 3)];
  const hasActive = combined.some((item) => item.isActive);

  return hasActive ? 1 : 2;
};

const getTimerColor = (state) => {
  let blue = state?.blueTeam || {};
  let red = state?.redTeam || {};
  let blueBans = blue?.bans || [];
  let redBans = red?.bans || [];
  let blueSlots = blue?.slots || [];
  let redSlots = red?.slots || [];

  let blueHasActive =
    blueBans.some((item) => item.isActive) || blueSlots.some((item) => item.isActive);
  let redHasActive =
    redBans.some((item) => item.isActive) || redSlots.some((item) => item.isActive);

  if (blueHasActive) {
    return "blue";
  } else if (redHasActive) {
    return "red";
  } else {
    return "none";
  }
};

const getTeamSeriesWins = (team) =>
  team?.seriesScore?.wins ?? team?.score?.series?.wins ?? 0;

const getPickBanBestOf = (state) => {
  if (state?.bestOf != null) return Number(state.bestOf);
  if (state?.metaData?.bestOf != null) return Number(state.metaData.bestOf);
  let md = getMatchData();
  if (md?.bestOf != null) return Number(md.bestOf);
  return 1;
};

/**
 * Scoreboard-style split: top bar = bans, teams + match BO pills, center (best-of, LAN ring timer, logo, patch); bottom = pick rows only.
 */
export const PickBan2026V1Theme = () => {
  return <CardRowPickBanLayout />;
};

const CardRowPickBanLayout = () => {
  const { championSelectState } = useBlueBottleContext();
  const phase = getTournamentPhase(championSelectState ?? {});
  const md = getMatchData();
  const c1 = md?.team1?.color ?? "#318CE7";
  const c2 = md?.team2?.color ?? "#d90718";

  return (
    <Overlay>
      <div
        className="pick-and-ban-container pickban-card-row"
      >
        <div className={`pick-and-ban-bg phase-${phase} pickban-split`}>
          <PickBanTopBar phase={phase} />
          <div className="pickban-bottom-bar">
            <div className="pickban-picks-area">
              <RowBlueSide phase={phase} />
              <RowMiddleStrip phase={phase} />
              <RowRedSide phase={phase} />
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

const LAN_TIMER_SIZES = {
  compact: { size: 56, stroke: 6 },
  pickbanCenter: { size: 120, stroke: 10 },
  full: { size: 101, stroke: 10 },
};

const LanTimer = ({ variant = "compact" }) => {
  const { championSelectState } = useBlueBottleContext();
  const timerColor = getTimerColor(championSelectState);
  const timer = championSelectState?.timer?.timeRemaining ?? 0;
  const maxRaw = championSelectState?.timer?.phaseDuration ?? 60;
  const max = Math.max(maxRaw, 1e-6);
  const progress = Math.min(Math.max(timer / max, 0), 1);
  const displaySeconds = Math.max(0, Math.ceil(timer));

  const { size, stroke } = LAN_TIMER_SIZES[variant] ?? LAN_TIMER_SIZES.compact;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const dashOffset = c * (1 - progress);

  return (
    <div
      className={`lan-timer pickban-lan-timer pickban-lan-timer--${variant} ${timerColor}`}
      role="timer"
      aria-live="polite"
      aria-valuemin={0}
      aria-valuemax={Math.ceil(max)}
      aria-valuenow={displaySeconds}
    >
      <div className={`lan-timer-container ${timerColor}`}>◀</div>
      <svg
        className="lan-timer-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          <circle
            className="lan-timer-ring-track"
            cx={cx}
            cy={cx}
            r={r}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            className="lan-timer-ring-progress"
            cx={cx}
            cy={cx}
            r={r}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={c}
            style={{ strokeDashoffset: dashOffset }}
          />
        </g>
      </svg>
      <span className="lan-timer-label">{displaySeconds}</span>
    </div>
  );
};

const PickBanSeriesScore = ({ games, wins, side }) => {
  const gamesArray = Array.from({ length: Math.max(0, games - 1) }, (_, index) => index + 1);

  return (
    <div className={`pickban-series-score series-score ${side}`}>
      {gamesArray.map((game) => {
        const won = game <= wins;
        return <div key={game} className={`game${won ? " won" : ""}`} />;
      })}
    </div>
  );
};

const PickBanTopBans = ({ side }) => {
  const { championSelectState } = useBlueBottleContext();
  let bans = [...(championSelectState?.[side === "blue" ? "blueTeam" : "redTeam"]?.bans || [])];
  while (bans.length < 5) {
    bans.push({});
  }

  return (
    <div className={`pickban-top-bans ${side}`}>
      {bans.map((ban, index) => {
        const champion = ban?.champion;
        const imgPath = champion?.squareImg || champion?.splashCenteredImg;
        const img = imgPath ? getImagePath(imgPath) : null;

        return (
          <div key={index} className={`ban ${ban?.isActive ? "active" : ""} i${index + 1}`}>
            {img ? (
              <div className="ban-champion">
                <img src={img} alt="" />
              </div>
            ) : <div className="ban-icon">{index + 1}</div>}
          </div>
        );
      })}
    </div>
  );
};

const PickBanTopBar = ({ phase }) => {
  const { championSelectState } = useBlueBottleContext();
  const state = championSelectState ?? {};
  const blueTeam = state?.blueTeam || {};
  const redTeam = state?.redTeam || {};
  const md = getMatchData();

  const blueTag = blueTeam?.metaData?.tag || md?.team1?.tag || "-";
  const redTag = redTeam?.metaData?.tag || md?.team2?.tag || "-";

  const fallbackLogo =
    "https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Esports_organization_Fnatic_logo.svg/450px-Esports_organization_Fnatic_logo.svg.png";
  let blueLogo = getImagePath(blueTeam?.metaData?.iconUri || md?.team1?.image || fallbackLogo);
  let redLogo = getImagePath(redTeam?.metaData?.iconUri || md?.team2?.image || fallbackLogo);

  const timerColor = getTimerColor(state);
  const patch = md?.patch || "15.7";
  const bestOf = getPickBanBestOf(state);
  const seriesBlue = getTeamSeriesWins(blueTeam);
  const seriesRed = getTeamSeriesWins(redTeam);

  let bestOfText = "ONE";
  if (bestOf === 1) {
    bestOfText = "ONE";
  }
  if (bestOf === 3) {
    bestOfText = "THREE";
  }
  if (bestOf === 5) {
    bestOfText = "FIVE";
  }

  return (
    <div className={`pickban-top-bar phase-${phase} ${timerColor}`}>
      <PickBanTopBans side="blue" />

      <div className="pickban-team-cluster blue">
        <div className="team-tag blue">{blueTag}</div>
        {blueLogo ? <img src={blueLogo} alt="" className="team-logo blue" /> : null}
        <PickBanSeriesScore games={bestOf} wins={seriesBlue} side="blue" />
      </div>


      <div className="pickban-top-center">
        <div className="best-of">
          <div className="best-of-text">BEST OF</div>
          <div className="best-of-value">{bestOfText}</div>
        </div>
        <div className="pickban-top-space">

        </div>
        <div className="patch">
          <div className="patch-text">PATCH</div>
          <div className="patch-value">{patch}</div>
        </div>
      </div>

      <div className="pickban-team-cluster red">
        <PickBanSeriesScore games={bestOf} wins={seriesRed} side="red" />
        {redLogo ? <img src={redLogo} alt="" className="team-logo red" /> : null}
        <div className="team-tag red">{redTag}</div>
      </div>
      <PickBanTopBans side="red" />
    </div>
  );
};

/** Narrow center column between pick rows (phase chrome only). */
const RowMiddleStrip = ({ phase }) => {
  const { championSelectState } = useBlueBottleContext();
  const mainLogo = getImagePath("cache/style/mainIcon.png");

  return <div className={`middle phase-${phase} pickban-middle-strip`}>
    {mainLogo ? (
      <div className="tournament-logo">
        <img src={mainLogo} alt="" />
      </div>
    ) : null}
    <div className="pickban-middle-space"></div>
    <LanTimer variant="pickbanCenter" />
  </div>;
};

const RowBlueSide = ({ phase }) => {
  const { championSelectState } = useBlueBottleContext();
  const slots = championSelectState?.blueTeam?.slots || [];

  return (
    <div className={`blue-side phase-${phase} players`}>
      {slots.map((slot, index) => (
        <RowPlayer key={index} slot={slot} state={championSelectState} side="blue" index={index} />
      ))}
    </div>
  );
};

const RowRedSide = ({ phase }) => {
  const { championSelectState } = useBlueBottleContext();
  const slots = championSelectState?.redTeam?.slots || [];

  return (
    <div className={`red-side phase-${phase} players`}>
      {slots.map((slot, index) => (
        <RowPlayer key={index} slot={slot} state={championSelectState} side="red" index={index} />
      ))}
    </div>
  );
};

const RowPlayer = ({ slot, state, side, index }) => {
  let icon = undefined;
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
    default:
      break;
  }

  const champion = slot?.champion || undefined;
  let img = undefined;
  if (champion?.splashCenteredImg) {
    img = getImagePath(champion.splashCenteredImg);
  }

  const playerId = slot?.player;
  const members = side === "blue" ? state?.blueTeam?.metaData?.members : state?.redTeam?.metaData?.members;
  const member = Array.isArray(members) ? members.find((m) => m.puuid === playerId) : undefined;
  const playerName = member?.alias || playerId || `Player ${index + 1}`;

  return (
    <div className={`player ${slot?.isActive ? "active" : ""}`}>
      {icon}
      <div className="player-name">{playerName}</div>
      {slot?.isActive && <div className="player-active" />}
      <div
        className="bg-champion"
        style={{
          backgroundImage: img ? `url(${img})` : undefined,
        }}
      />
    </div>
  );
};

const getImagePath = (path) => {
  if (!path) return null;
  const { hostname } = window.location;
  const address = getBlueBottleAddress();
  const port = getBlueBottlePort();
  if (address && address != hostname) {
    return `http://${address}:${port}/${path}`;
  }

  return `http://${hostname}:${port}/${path}`;
};
