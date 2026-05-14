import { useBlueBottleContext } from "../../../../BlueBottle";
import { getImagePath } from "../../../../../utils/images";
import { formatTime } from "../../../../../utils/formatTime";
import { map } from "../../../../../utils/map";
import "./Timer.scss";

export function Timer({ type = "dragon" }) {
  const { ingameState } = useBlueBottleContext();
  const { dragonPitTimer, baronPitTimer, gameTime } = ingameState ?? {};

  const timer =
    type === "dragon"
      ? dragonPitTimer
      : baronPitTimer;

  if (!timer) return null;

  let image = null;
  if(type === "dragon") {
    let dragon = null;
    switch(timer?.type) {
      case "DRAGON_AIR":
        dragon = "air";
        break;
      case "DRAGON_FIRE":
        dragon = "fire";
        break;
      case "DRAGON_WATER":
        dragon = "water";
        break;
      case "DRAGON_EARTH":
        dragon = "earth";
        break;
      case "DRAGON_HEXTECH":
        dragon = "hextech";
        break;
      case "DRAGON_CHEMTECH":
        dragon = "chemtech";
        break;
      case "DRAGON_ELDER":
        dragon = "elder";
        break;
    }
    image = getImagePath(`cache/style/ingame/objectives/dragonpit/${dragon}.png`);
  } else if(type === "baron") {
    let objective = timer?.type;
    switch(objective) {
      case "GRUB":
        image = getImagePath(`cache/style/ingame/objectives/baronpit/grubs.png`);
        break;
      case "HERALD":
        image = getImagePath(`cache/style/ingame/objectives/baronpit/herald.png`);
        break;
      case "BARON":
        image = getImagePath(`cache/style/ingame/objectives/baronpit/baron.png`);
        break;
    }
  }

  let time = timer?.timeAlive - gameTime;
  if(time < 0) time = 0;

  let timeDestroyed = 0;
  if(timer?.type == "DRAGON_ELDER" || timer?.type == "BARON") {
    timeDestroyed = timer?.timeAlive - 6 * 60;
  } else {
    timeDestroyed = timer?.timeAlive - 5 * 60;
  }
  if(timeDestroyed < 0) timeDestroyed = 0;

  let barHeight = map(gameTime, timeDestroyed, timer?.timeAlive, 100, 0);

  return <div className={`timer ${type} ${time <= 0 ? "live" : ""} ${(timer?.type || "").toLowerCase()}`}>
    <div className="image"><img src={image} alt={timer?.type} /></div>
    <div className="timer-bar">
      <div className="timer-bar-inner" style={{ height: `${barHeight}%` }}></div>
    </div>
    <div className="time">{formatTime(time, "00:00")}</div>
  </div>;
}
