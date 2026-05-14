import * as I from "csgogsi";
import "./matchbar.scss";
import TeamScore from "./TeamScore";
import RoundsStrip from "./RoundsStrip";
import Bomb from "./../Timers/BombTimer";
import { useBombTimer } from "./../Timers/Countdown";
import { Match } from './../../API/types';

function stringToClock(time: string | number, pad = true) {
  if (typeof time === "string") {
    time = parseFloat(time);
  }
  const countdown = Math.abs(Math.ceil(time));
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown - minutes * 60;
  if (pad && seconds < 10) {
    return `${minutes}:0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

interface IProps {
  match: Match | null;
  map: I.Map;
  phase: I.CSGO["phase_countdowns"],
  bomb: I.Bomb | null,
}

export interface Timer {
  time: number;
  active: boolean;
  side: "left"|"right";
  type: "defusing" | "planting";
  player: I.Player | null;
}
const REGULATION_MR = 12;
const REGULATION_ROUNDS = REGULATION_MR * 2;
const OT_ROUNDS = 6;

const getRoundLabel = (mapRound: number) => {
  const round = mapRound + 1;
  if (round <= REGULATION_ROUNDS) {
    return `RUNDE ${round}`;
  }
  const additionalRounds = round - REGULATION_ROUNDS;
  const OT = Math.ceil(additionalRounds / OT_ROUNDS);
  return `OT ${OT} (${additionalRounds - (OT - 1) * OT_ROUNDS}/${OT_ROUNDS})`;
};

const getRoundsLeftLabel = (ctScore: number, tScore: number) => {
  const total = ctScore + tScore;

  if (ctScore === REGULATION_MR && tScore === REGULATION_MR) {
    return "OT 3 / 3";
  }

  if (total < REGULATION_ROUNDS) {
    const left = REGULATION_ROUNDS - total;
    return `${left} ${left === 1 ? "RUNDE" : "RUNDEN"} ÜBRIG`;
  }

  const otRoundsPlayed = total - REGULATION_ROUNDS;
  const otCycle = Math.ceil(otRoundsPlayed / OT_ROUNDS);
  const inCycle = otRoundsPlayed - (otCycle - 1) * OT_ROUNDS;
  return `OT ${otCycle} (${inCycle}/${OT_ROUNDS})`;
};

const ROUNDS_STRIP_PHASE_IGNORE = ["bomb", "defuse"];

const Matchbar = (props: IProps) => {
    const { bomb, match, map, phase } = props;
    const time = stringToClock(phase.phase_ends_in);
    const left = map.team_ct.orientation === "left" ? map.team_ct : map.team_t;
    const right = map.team_ct.orientation === "left" ? map.team_t : map.team_ct;
    let isPlanted = bomb && (bomb.state === "defusing" || bomb.state === "planted");
    const bo = (match && Number(match.matchType.substr(-1))) || 0;
    const bombSite =
      bomb?.site && typeof bomb.site === "string"
        ? bomb.site.toUpperCase()
        : null;

    const bombData = useBombTimer();
    let plantTimer: Timer | null = bombData.state === "planting" ? { time:bombData.plantTime, active: true, side: bombData.player?.team.orientation || "right", player: bombData.player, type: "planting"} : null;
    let defuseTimer: Timer | null = bombData.state === "defusing" ? { time:bombData.defuseTime, active: true, side: bombData.player?.team.orientation || "left", player: bombData.player, type: "defusing"} : null;

    const dontShowRoundsStrip = ROUNDS_STRIP_PHASE_IGNORE.includes(phase.phase || "") || bomb?.state == "planting";

    return (
      <>
        <div className="matchbar-container">
          <div className="matchbar-inner-top">

            <TeamScore team={left} orientation={"left"} timer={left.side === "CT" ? defuseTimer : plantTimer}/>

            <div className={`timer ${bo === 0 ? 'no-bo' : ''}`}>
              <div className={`score ${left.side}`}>{left.score}</div>
              <div className={`time ${isPlanted ? "hide":""}`}>{time}</div>
              <div className={`round ${isPlanted ? "hide":""}`}>{getRoundLabel(map.round)}</div>
              <div className={`score right ${right.side}`}>{right.score}</div>
            </div>

            <TeamScore team={right} orientation={"right"} timer={right.side === "CT" ? defuseTimer : plantTimer} />
          </div>
          <div className="matchbar-inner-bottom">
            <Bomb />
            <RoundsStrip map={map} hide={dontShowRoundsStrip} />
          </div>
        </div>
      </>
    );
}

export default Matchbar;
