import { Fragment } from "react";
import * as I from "csgogsi";
import { Skull, Defuse, BombExplosion, Hourglass } from "../../assets/Icons";

const REGULATION_MR = 12;
const REGULATION_ROUNDS = REGULATION_MR * 2;
const OT_ROUNDS = 6;
const OT_HALF = OT_ROUNDS / 2;
const VISIBLE_WINDOW = 24;

interface RoundSlot {
  roundNumber: number;
  outcome: I.RoundOutcome | null;
  isActive: boolean;
  switchAfter: boolean;
}

const buildRoundSlots = (
  currentRound: number,
  roundWins: I.RoundWins | undefined
): RoundSlot[] => {
  const wins = roundWins ?? {};
  let windowEnd: number;
  if (currentRound <= REGULATION_ROUNDS) {
    windowEnd = REGULATION_ROUNDS;
  } else {
    const otRoundsPlayed = currentRound - REGULATION_ROUNDS;
    const otCycle = Math.ceil(otRoundsPlayed / OT_ROUNDS);
    windowEnd = REGULATION_ROUNDS + otCycle * OT_ROUNDS;
  }
  const windowStart = Math.max(1, windowEnd - VISIBLE_WINDOW + 1);

  const slots: RoundSlot[] = [];
  for (let r = windowStart; r <= windowEnd; r++) {
    const outcome = wins[String(r)] ?? null;
    const switchAfter =
      r === REGULATION_MR ||
      (r > REGULATION_ROUNDS &&
        (r - REGULATION_ROUNDS) % OT_ROUNDS === OT_HALF);
    slots.push({
      roundNumber: r,
      outcome,
      isActive: r === currentRound,
      switchAfter,
    });
  }
  return slots;
};

const getOutcomeSide = (outcome: I.RoundOutcome): "CT" | "T" =>
  outcome.startsWith("ct_") ? "CT" : "T";

const getOutcomeIcon = (outcome: I.RoundOutcome) => {
  switch (outcome) {
    case "ct_win_defuse":
      return <Defuse />;
    case "t_win_bomb":
      return <BombExplosion />;
    case "ct_win_time":
      return <Hourglass />;
    case "ct_win_elimination":
    case "t_win_elimination":
    default:
      return <Skull />;
  }
};

interface RoundsStripProps {
  map: I.Map;
  hide?: boolean;
}

const RoundsStrip = ({ map, hide = false }: RoundsStripProps) => (
  <div className={`rounds-strip ${hide ? "hide" : "show"}`}>
    {buildRoundSlots(map.round + 1, map.round_wins).map((slot) => {
      const sideClass = slot.outcome
        ? getOutcomeSide(slot.outcome)
        : "empty";
      const activeClass = slot.isActive ? " active" : "";
      return (
        <Fragment key={slot.roundNumber}>
          <div
            className={`round-indicator ${sideClass}${activeClass}`}
            title={
              slot.outcome
                ? `Runde ${slot.roundNumber}: ${slot.outcome}`
                : `Runde ${slot.roundNumber}`
            }
          >
            {slot.outcome
              ? getOutcomeIcon(slot.outcome)
              : slot.roundNumber}
          </div>
          {slot.switchAfter && (
            <div className="side-switch" aria-hidden="true" />
          )}
        </Fragment>
      );
    })}
  </div>
);

export default RoundsStrip;
