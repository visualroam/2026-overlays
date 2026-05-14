import { useMemo } from "react";
import { useBlueBottleContext } from "../../../../BlueBottle";
import { formatTime } from "../../../../../utils/formatTime";
import { ReactComponent as LaneTop } from "../../../../../assets/icons/lanes/top.svg";
import { ReactComponent as LaneMid } from "../../../../../assets/icons/lanes/mid.svg";
import { ReactComponent as LaneBot } from "../../../../../assets/icons/lanes/bot.svg";
import "./InhibitorOverMinimap.scss";

const INHIB_LANE_KEYS = ["L0", "L1", "L2"];

function resolveIngameGameTime(ingameState) {
  const raw =
    ingameState?.gameTime ??
    ingameState?.scoreboard?.gameTime ??
    ingameState?.scoreboardBottom?.gameTime;
  const t = Number(raw);
  return Number.isFinite(t) ? t : null;
}

function inhibitorRespawnSecondsLeft(inh, gameTime) {
  const destroyedAt = Number(inh?.timeDestroy);
  const respawnsAt = Number(inh?.timeAlive);
  const gt = Number(gameTime);
  if (!Number.isFinite(destroyedAt) || destroyedAt <= 0) return null;
  if (!Number.isFinite(respawnsAt) || !Number.isFinite(gt)) return null;
  return Math.max(0, respawnsAt - gt);
}

function inhibitorBarFraction(inh, gameTime) {
  const secLeft = inhibitorRespawnSecondsLeft(inh, gameTime);
  if (secLeft == null || secLeft <= 0) return null;
  const destroyedAt = Number(inh?.timeDestroy);
  const respawnsAt = Number(inh?.timeAlive);
  const total =
    Number.isFinite(destroyedAt) && Number.isFinite(respawnsAt)
      ? respawnsAt - destroyedAt
      : NaN;
  const denom = Number.isFinite(total) && total > 1 ? total : 300;
  return Math.min(1, Math.max(0, secLeft / denom));
}

/** Label + whether this side is actively counting down a respawn. */
function sideInhibitorDisplay(inh, gameTime) {
  if (inh == null || typeof inh !== "object") {
    return { label: "—", down: false };
  }
  const destroyedAt = Number(inh?.timeDestroy);
  if (!Number.isFinite(destroyedAt) || destroyedAt <= 0) {
    return { label: "UP", down: false };
  }
  const secLeft = inhibitorRespawnSecondsLeft(inh, gameTime);
  if (secLeft == null) {
    return { label: "—", down: false };
  }
  if (secLeft <= 0) {
    return { label: "UP", down: false };
  }
  return { label: formatTime(secLeft, "UP"), down: true };
}

function anyInhibitorRespawning(teams, gameTime) {
  if (gameTime == null) return false;
  const gt = Number(gameTime);
  if (!Number.isFinite(gt)) return false;

  for (const team of teams) {
    const byLane = team?.inhibitors ?? {};
    for (const laneKey of INHIB_LANE_KEYS) {
      const inh = byLane[laneKey];
      const destroyedAt = Number(inh?.timeDestroy);
      if (!Number.isFinite(destroyedAt) || destroyedAt <= 0) continue;
      const respawnsAt = Number(inh?.timeAlive);
      if (!Number.isFinite(respawnsAt)) return true;
      if (gt < respawnsAt) return true;
    }
  }
  return false;
}

function teamBlockBySide(teams, side) {
  return teams.find((t) => Number(t?.side) === side) ?? null;
}

function LaneGlyph({ laneKey, bright }) {
  const cls = `minimap-inhibitors__lane-icon${bright ? " minimap-inhibitors__lane-icon--bright" : ""}`;
  if (laneKey === "L0") return <LaneBot className={cls} />;
  if (laneKey === "L1") return <LaneMid className={cls} />;
  return <LaneTop className={cls} />;
}

function MinimapSideCell({ inh, gameTime, variant }) {
  const { label, down } = sideInhibitorDisplay(inh, gameTime);
  const barFrac = down ? inhibitorBarFraction(inh, gameTime) : null;
  const barPct = barFrac != null ? barFrac * 100 : 0;

  return (
    <div
      className={`minimap-inhibitors__side minimap-inhibitors__side--${variant}${down ? " minimap-inhibitors__side--down" : ""}`}
    >
      <div
        className={`minimap-inhibitors__time-cell${down ? " minimap-inhibitors__time-cell--active" : ""}`}
      >
        <div className="minimap-inhibitors__bar-track" aria-hidden />
        {down ? (
          <div
            className="minimap-inhibitors__bar-fill"
            style={{ width: `${barPct}%` }}
            aria-hidden
          />
        ) : null}
        <span className="minimap-inhibitors__time">{label}</span>
      </div>
    </div>
  );
}

function MinimapLaneRow({ laneKey, blueInh, redInh, gameTime }) {
  const blueD = sideInhibitorDisplay(blueInh, gameTime);
  const redD = sideInhibitorDisplay(redInh, gameTime);
  const rowBright = blueD.down || redD.down;

  return (
    <div className={`minimap-inhibitors__row${rowBright ? " minimap-inhibitors__row--any-down" : ""}`}>
      <MinimapSideCell inh={blueInh} gameTime={gameTime} variant="blue" />
      <div className="minimap-inhibitors__lane">
        <LaneGlyph laneKey={laneKey} bright={rowBright} />
      </div>
      <MinimapSideCell inh={redInh} gameTime={gameTime} variant="red" />
    </div>
  );
}

/** Bottom overlay on the minimap when any inhibitor respawn is active. */
export function InhibitorOverMinimap() {
  const { ingameState } = useBlueBottleContext();
  const gameTime = resolveIngameGameTime(ingameState);

  const teams = useMemo(() => {
    const raw = ingameState?.inhibitors;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return [...raw].sort((a, b) => Number(a?.side) - Number(b?.side));
  }, [ingameState?.inhibitors]);

  const visible =
    teams.length > 0 && gameTime != null && anyInhibitorRespawning(teams, gameTime);

  if (!visible) return null;

  const blue = teamBlockBySide(teams, 1);
  const red = teamBlockBySide(teams, 2);
  const blueBy = blue?.inhibitors ?? {};
  const redBy = red?.inhibitors ?? {};

  return (
    <div className="minimap-inhibitors" aria-label="Inhibitor respawn timers">
      {INHIB_LANE_KEYS.map((laneKey) => (
        <MinimapLaneRow
          key={laneKey}
          laneKey={laneKey}
          blueInh={blueBy[laneKey]}
          redInh={redBy[laneKey]}
          gameTime={gameTime}
        />
      ))}
    </div>
  );
}
