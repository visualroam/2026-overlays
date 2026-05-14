import React from "react";
import { StatfeedEvent } from "../../lhm-rl-module";
import HexPattern from "../HexPattern";
import CameraView from "../Camera/Camera";
import WhepSlotVideo from "../Camera/WhepSlotVideo";
import { Slot } from "../Camera/whepStreams";
import "./TeamBox.scss";

import { actions } from "./../../App";

interface Props {
  side: "blue" | "orange";
  lastBallHit: any;
  players: any[];
  statfeedEvents: StatfeedEvent[];
  observedId?: string;
}

const eventWhitelist: {
  event_name: string;
  icon: string;
  type: string;
}[] = [
  { event_name: "EpicSave", icon: "fa-shield-alt", type: "Epic Save" },
  { event_name: "Save", icon: "fa-shield", type: "Save" },
  { event_name: "Shot", icon: "fa-futbol", type: "Shot on Goal" },
  { event_name: "Demolish", icon: "fa-bomb", type: "Demolition" },
];

const TeamBox = (props: Props) => {
  const { side, players, statfeedEvents, observedId } = props;
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    actions.on("playerCams", (state: any) => {
      setShow(state === "show");
    });
    actions.on("toggleCams", () => {
      setShow((s) => !s);
    });
  }, []);

  // Slot mapping: blue team → 1..3, orange team → 4..6 (idx 0..2 within team).
  const slotFor = (idx: number): Slot => {
    const base = side === "blue" ? 1 : 4;
    return (base + idx) as Slot;
  };

  const createPlayerBox = (player: any, idx: number) => {
    const earliest = Date.now() - 3 * 1000;
    const visibleEvent = statfeedEvents
      .filter(
        (event) =>
          eventWhitelist.find(
            (e) => e.event_name === event.event_name || e.type === event.type
          ) &&
          event.main_target.id === player.id &&
          event.timestamp &&
          event.timestamp >= earliest
      )
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))[0];

    const foundEventSpec = visibleEvent
      ? eventWhitelist.find(
          (e) =>
            e.event_name === visibleEvent.event_name ||
            e.type === visibleEvent.type
        )
      : null;
    const iconClass = foundEventSpec?.icon || "fa-bullseye";

    const boost = Math.max(0, Math.min(100, player.boost || 0));
    const boostNumClassName =
      boost > 60
        ? "very-high"
        : boost > 40
        ? "high"
        : boost > 20
        ? "low"
        : "critical";

    const isObserved = !!observedId && observedId === player.id;

    return (
      <div
        className={`player ${side} ${player.isDead ? "dead" : ""} ${
          show ? "with-cam" : ""
        } ${isObserved ? "active" : ""}`}
        key={player.id || idx}
      >
        <div className="player-bg" />

        {show && (
          <div className="player-cam">
            {player.steamid && (
              <CameraView steamid={player.steamid} visible={true} />
            )}
            <WhepSlotVideo slot={slotFor(idx)} />
          </div>
        )}

        <div className={`player-content ${visibleEvent ? "with-event" : ""}`}>
          <div className="player-row top">
            <div className="player-slot">{idx + 1}</div>
            <div className={`player-name ${player.isSonic ? "shake" : ""}`}>
              {player.name}
            </div>
            <div
              className={`boost-num ${boostNumClassName} ${
                player.isSonic ? "shake" : ""
              }`}
            >
              <i className="fal fa-bolt" />
              <span>{boost}</span>
            </div>
          </div>

          <div className="player-row stats">
            <div className="stat" title="Goals">
              <i className="fal fa-bullseye" />
              <span>{player.goals}</span>
            </div>
            <div className="stat" title="Assists">
              <i className="fal fa-hands-helping" />
              <span>{player.assists}</span>
            </div>
            <div className="stat" title="Saves">
              <i className="fal fa-shield-alt" />
              <span>{player.saves}</span>
            </div>
            <div className="stat" title="Shots">
              <i className="fal fa-futbol" />
              <span>{player.shots}</span>
            </div>
            <div className="stat" title="Demos">
              <i className="fal fa-bomb" />
              <span>{player.demos}</span>
            </div>
          </div>
        </div>

        <div className="player-boost-bar" style={{ width: `${boost}%` }}>
          <HexPattern
            size={14}
            gap={2}
            strokeWidth={1}
            strokeColor="rgba(255,255,255,0.6)"
            opacity={0.5}
            className="hex"
          />
        </div>

        <div
          className={`statfeed-event ${
            visibleEvent
              ? `show ${(
                  visibleEvent.event_name ||
                  visibleEvent.type?.replaceAll(" ", "-")
                ).toLowerCase()}`
              : "hide"
          }`}
        >
          {visibleEvent && (
            <>
              <div className="type">{visibleEvent.type}</div>
              <i className={`fal ${iconClass} icon`} />
            </>
          )}
        </div>

        {player.isDead && (
          <div className="dead-overlay">
            <i className="fal fa-skull" />
          </div>
        )}
      </div>
    );
  };

  if (!players) return null;
  return (
    <div className={`teambox ${side} ${show ? "with-cams" : "compact"}`}>
      {players.map(createPlayerBox)}
    </div>
  );
};

export default TeamBox;
