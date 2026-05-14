import "./Minimap.scss";
import { InhibitorOverMinimap } from "./InhibitorOverMinimap";

export function Minimap() {
  return <div className="minimap">
    <div className="minimap-top-left"></div>
    <div className="minimap-top-right"></div>
    <div className="minimap-bottom-left"></div>
    <div className="minimap-bottom-right"></div>
    <div className="minimap-inner">
      <div className="minimap-inner-top"></div>
      <div className="minimap-inner-bottom"></div>
      <div className="minimap-inner-left"></div>
      <div className="minimap-inner-right"></div>
    </div>
    <div className="minimap-overlay">
      <InhibitorOverMinimap />
    </div>
  </div>;
}
