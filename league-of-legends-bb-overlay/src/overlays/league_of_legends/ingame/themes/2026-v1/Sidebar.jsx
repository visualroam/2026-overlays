import { useState, useEffect } from "react";
import { useBlueBottleContext } from "../../../../BlueBottle";
import { getImagePath } from "../../../../../utils/images";
import { map } from "../../../../../utils/map";
import { formatGold } from "../../../../../utils/formatGold";
import "./Sidebar.scss";

export function Sidebar() {
  const { ingameState } = useBlueBottleContext();
  const { sideInfoPage } = ingameState ?? {};

  const [persistentSideInfoPage, setPersistentSideInfoPage] = useState(sideInfoPage);
  const show = sideInfoPage !== null && sideInfoPage !== undefined;

  useEffect(() => {
    if(sideInfoPage !== null && sideInfoPage !== undefined) {
      setPersistentSideInfoPage(sideInfoPage);
    }
  }, [sideInfoPage]);

  let sideBarTitle = "";
  if(persistentSideInfoPage?.title === "infopage.gold.total") sideBarTitle = "GOLD PER CHAMPION";
  if(persistentSideInfoPage?.title === "infopage.damage.total") sideBarTitle = "DMG PER CHAMPION";
  if(persistentSideInfoPage?.title === "infopage.experience.total") sideBarTitle = "LEVEL | XP PER CHAMPION";
  if(persistentSideInfoPage?.title === "infopage.creepscore.total") sideBarTitle = "CS PER CHAMPION";

  const players = persistentSideInfoPage?.players ?? [];
  const sortedPlayers = players.sort((a, b) => {
    return b.curValue - a.curValue;
  });

  console.log(
    persistentSideInfoPage?.title,
    persistentSideInfoPage?.players
  );

  return <div className={`sidebar ${show ? "show" : ""}`}>
    <div className="sidebar-title">{sideBarTitle}</div>
    <div className="sidebar-content">
      {sortedPlayers.map((item) => {
        let team = "blue";
        if(item.team === 2) team = "red";

        let champion = item.champion ?? {};
        let image = getImagePath(`${champion?.splashCenteredImg ?? champion?.squareImg ?? ""}`);
        let max = item.maxValue ?? 0;
        let min = item.minValue ?? 0;
        let current = item.curValue ?? 0;
        let percentage = map(current, min, max, 0, 100);

        let playerName = (item.playerName ?? "").split("#")[0] ?? "";
        let formattedValue = Math.round(item.curValue ?? 0);
        if(persistentSideInfoPage?.title === "infopage.gold.total") formattedValue = `${formatGold(item.curValue ?? 0)}k`;
        if(persistentSideInfoPage?.title === "infopage.damage.total") formattedValue = `${formatGold(item.curValue ?? 0)}k`;
        if(persistentSideInfoPage?.title === "infopage.experience.total") formattedValue = `LVL ${item.displayValue}`;
        if(persistentSideInfoPage?.title === "infopage.creepscore.total") formattedValue = `${Math.round(item.curValue ?? 0)}`;

        return <div className="sidebar-item">
          <img src={image} />
          <div className="sidebar-item-wrapper">
            <div className="sidebar-item-header">
              <div className="sidebar-item-name">{playerName}</div>
              <div className="sidebar-item-value">{formattedValue}</div>
            </div>
            <div className={`sidebar-item-bar ${team}`}>
              <div className="sidebar-item-bar-inner" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}
