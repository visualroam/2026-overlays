import React, { useState } from "react";
import { CSGOGSI, Player } from "csgogsi";
import Weapon from "./../Weapon/Weapon";
import Avatar from "./Avatar";
import TeamLogo from "./../MatchBar/TeamLogo";
import "./observed.scss";
import { getCountry } from "./../countries";
import { ArmorHelmet, ArmorFull, HealthFull, Bullets } from './../../assets/Icons';
import { apiUrl } from './../../API';
import { useAction, useConfig } from "../../API/contexts/actions";
import { CSGO } from "csgogsi";
import CameraContainer from "../Camera/Container";
import HexPattern from "./HexPattern";

const PHASE_IGNORE = ["over", "freezetime", "timeout_ct", "paused", "timeout_t"];

const Observed = ({ player, game }: { player: Player | null, game: CSGO }) => {
	const [ showCam, setShowCam ] = useState(true);
	const [ compactMode, setCompactMode ] = useState(false);
	const layoutSettings = useConfig("layout_settings");

	useAction('toggleCams', () => {
		setShowCam(p => !p);
	});
	useAction("toggleCompactObserved", () => {
		setCompactMode((p) => !p);
	});

	if (!player) return null;

	const currentWeapon = player.weapons.filter(weapon => weapon.state === "active")[0];
	const grenades = player.weapons.filter(weapon => weapon.type === "Grenade");

	const activeLayoutMode = layoutSettings?.layout_mode || "standard";
	const compact = compactMode || activeLayoutMode === "compact";

  const dontShow = player.state.health === 0 || PHASE_IGNORE.includes(game?.phase_countdowns.phase || "");

  if (dontShow) {
    return null;
  }

	return (
		<><CameraContainer observedSteamid={player.steamid} />
    <div className={`observed ${player.team.side} ${compact ? "compact" : ""} ${showCam ? "cam-active" : ""}`}>

      <div className="observed-bg" />

      <div className="observed-player-health">
        <div className="observed-player-name">{player.name}</div>
        <HealthFull fill="white" height="20px" width="20px" className="observed-player-health-icon" />
        <div className="observed-player-health-value">{player.state.health}</div>
        <div className="observed-player-health-bar" style={{ width: `${player.state.health}%` }}>
          <HexPattern
            size={16}
            gap={3}
            strokeWidth={1}
            strokeColor="rgba(255,255,255,0.7)"
            opacity={0.45}
            className="hex"
          />
        </div>
      </div>

      <div className="ammo">
        <div className="ammo-icon-container">
          <Bullets />
        </div>
        <div className="ammo-counter">
          <div className="ammo-clip">{(currentWeapon && currentWeapon.ammo_clip) || "-"}</div>
          <div className="ammo-reserve">{(currentWeapon && currentWeapon.ammo_reserve) || "-"}</div>
        </div>
      </div>

      <div className="grenades">
        {grenades.map(grenade => {
          return <React.Fragment key={`${player.steamid}_${grenade.name}_${grenade.ammo_reserve || 1}`}>
              <Weapon weapon={grenade.name} active={grenade.state === "active"} isGrenade />
              {
                grenade.ammo_reserve === 2 ? <Weapon weapon={grenade.name} active={grenade.state === "active"} isGrenade /> : null}
            </React.Fragment>
        })}
      </div>
		</div></>
	);
}

export default Observed;
