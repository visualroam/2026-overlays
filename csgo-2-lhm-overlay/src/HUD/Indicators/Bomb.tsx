import { Player } from "csgogsi";
import { Bomb as BombIcon } from "./../../assets/Icons";
const Bomb = ({ player }: { player: Player }) => {
  if (Object.values(player.weapons).every((weapon) => weapon.type !== "C4")) {
    return null;
  }
  return (
    <div className={`armor-indicator bomb-indicator`}>
      <BombIcon height="25px" width="25px" />
    </div>
  );
};
export default Bomb;
