import { Timer } from "../MatchBar/MatchBar";
import { Player } from "csgogsi";
import * as I from "./../../assets/Icons";
import { MAX_TIMER } from "./Countdown";

interface IProps {
  timer: Timer | null;
  side: "right" | "left"
}

const getCaption = (type: "defusing" | "planting", player: Player | null) => {
  if (type === "defusing") {
    return (
      <>
        <I.Defuse height={22} width={22} fill="var(--color-new-ct)" />
        <div className={"CT"}>
          {player ? `${player.name} is defusing` : "Defuse in progress"}
        </div>
      </>
    );
  }
  return (
    <>
      <I.SmallBomb height={22} fill="var(--color-new-t)" />
      <div className={"T"}>
        {player ? `${player.name} is planting` : "Plant in progress"}
      </div>
    </>
  );
};
const Bomb = ({ timer, side }: IProps) =>{
  return (
    <div className={`defuse-plant-container ${side} ${timer && timer.active ? 'show' :'hide'} show`}>
      {
        timer ?
        <div className={`defuse-plant-caption`}>
          {getCaption(timer.type, timer.player)}
        </div> : null
      }

      {
        timer ?
        <div className="defuse-plant-bar" style={{ width: `${(timer.time * 100 / (timer.type === "planting" ? MAX_TIMER.planting : timer.player?.state.defusekit ? MAX_TIMER.defuse_kit : MAX_TIMER.defuse_nokit ))}%` }}></div> : null
      }
    </div>
  );
}
export default Bomb;
