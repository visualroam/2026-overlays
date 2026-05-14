import "./2026-v1.scss";
import { BottomScoreboard } from "./BottomScoreboard";
import { LatestSmiteReaction } from "./LatestSmiteReaction";
import { Minimap } from "./Minimap";
import { Scoreboard } from "./Scoreboard";
import { Sidebar } from "./Sidebar";
import { SponsorContainer } from "./SponsorContainer";
import { Timer } from "./Timer";
import { UnifiedEventFeed } from "./UnifiedEventFeed";
import WhepCycler from "../../../whep/WhepCycler";

/** 2026-v1 ingame shell (timers + room for more). Reads ingame state from BlueBottle context. */
export default function Ingame2026V1() {
  return (
    <div className="ingame-overlay-container theme-2026-v1">
      <Timer type="dragon" />
      <Timer type="baron" />
      <Scoreboard />
      <BottomScoreboard />
      <SponsorContainer />
      <Minimap />
      <UnifiedEventFeed />
      <LatestSmiteReaction />
      <Sidebar />
      <WhepCycler />
    </div>
  );
}
