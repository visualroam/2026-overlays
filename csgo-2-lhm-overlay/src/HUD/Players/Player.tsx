import * as I from "csgogsi";
import Weapon from "./../Weapon/Weapon";
import Avatar from "./Avatar";
import Armor from "./../Indicators/Armor";
import Bomb from "./../Indicators/Bomb";
import Defuse from "./../Indicators/Defuse";
import React from "react";
import { Skull, HealthFull } from "../../assets/Icons";
import HexPattern from "./HexPattern";

interface IProps {
  player: I.Player,
  isObserved: boolean,
  roundPhase?: I.PhaseRaw["phase"],
}

const HIDDEN_PHASES: Array<I.PhaseRaw["phase"]> = ["freezetime", "over", "paused", "timeout_ct", "timeout_t"];

const compareWeapon = (weaponOne: I.WeaponRaw, weaponTwo: I.WeaponRaw) => {
  if (weaponOne.name === weaponTwo.name &&
    weaponOne.paintkit === weaponTwo.paintkit &&
    weaponOne.type === weaponTwo.type &&
    weaponOne.ammo_clip === weaponTwo.ammo_clip &&
    weaponOne.ammo_clip_max === weaponTwo.ammo_clip_max &&
    weaponOne.ammo_reserve === weaponTwo.ammo_reserve &&
    weaponOne.state === weaponTwo.state
  ) return true;

  return false;
}

const compareWeapons = (weaponsObjectOne: I.Weapon[], weaponsObjectTwo: I.Weapon[]) => {
  const weaponsOne = [...weaponsObjectOne].sort((a, b) => a.name.localeCompare(b.name))
  const weaponsTwo = [...weaponsObjectTwo].sort((a, b) => a.name.localeCompare(b.name))

  if (weaponsOne.length !== weaponsTwo.length) return false;

  return weaponsOne.every((weapon, i) => compareWeapon(weapon, weaponsTwo[i]));
}

const arePlayersEqual = (playerOne: I.Player, playerTwo: I.Player) => {
  if (playerOne.name === playerTwo.name &&
    playerOne.steamid === playerTwo.steamid &&
    playerOne.observer_slot === playerTwo.observer_slot &&
    playerOne.defaultName === playerTwo.defaultName &&
    playerOne.clan === playerTwo.clan &&
    playerOne.stats.kills === playerTwo.stats.kills &&
    playerOne.stats.assists === playerTwo.stats.assists &&
    playerOne.stats.deaths === playerTwo.stats.deaths &&
    playerOne.stats.mvps === playerTwo.stats.mvps &&
    playerOne.stats.score === playerTwo.stats.score &&
    playerOne.state.health === playerTwo.state.health &&
    playerOne.state.armor === playerTwo.state.armor &&
    playerOne.state.helmet === playerTwo.state.helmet &&
    playerOne.state.defusekit === playerTwo.state.defusekit &&
    playerOne.state.flashed === playerTwo.state.flashed &&
    playerOne.state.smoked === playerTwo.state.smoked &&
    playerOne.state.burning === playerTwo.state.burning &&
    playerOne.state.money === playerTwo.state.money &&
    playerOne.state.round_killhs === playerTwo.state.round_killhs &&
    playerOne.state.round_kills === playerTwo.state.round_kills &&
    playerOne.state.round_totaldmg === playerTwo.state.round_totaldmg &&
    playerOne.state.equip_value === playerTwo.state.equip_value &&
    playerOne.state.adr === playerTwo.state.adr &&
    playerOne.avatar === playerTwo.avatar &&
    !!playerOne.team.id === !!playerTwo.team.id &&
    playerOne.team.side === playerTwo.team.side &&
    playerOne.country === playerTwo.country &&
    playerOne.realName === playerTwo.realName &&
    compareWeapons(playerOne.weapons, playerTwo.weapons)
  ) return true;

  return false;
}
const Player = ({ player, isObserved, roundPhase }: IProps) => {

  const weapons = player.weapons.map(weapon => ({ ...weapon, name: weapon.name.replace("weapon_", "") }));
  const primary = weapons.filter(weapon => !['C4', 'Pistol', 'Knife', 'Grenade', undefined].includes(weapon.type))[0] || null;
  const secondary = weapons.filter(weapon => weapon.type === "Pistol")[0] || null;
  const grenades = weapons.filter(weapon => weapon.type === "Grenade");
  const zeus = weapons.find(weapon => weapon.name === "taser");

  return (
    <div className={`player ${player.state.health === 0 ? "dead" : ""} ${isObserved ? 'active' : ''}`}>
      <div className="player-index">{player.observer_slot}</div>
      <div className="player-name">{player.name}</div>

      <div className="player-kills">
        <Skull height="16px" width="16px" fill="gold" />
        {player.stats.kills}
      </div>
      <div className="player-deaths">
        <HealthFull height="16px" width="16px" fill="red" />
        {player.stats.deaths}
      </div>

      <div className="dead">
        <Skull height="100px" width="100px" fill="white" />
      </div>

      <div className="player-health">
        {player.state.health}
      </div>

      <div className="money">
        <span>$</span>{player.state.money}
      </div>

      <Bomb player={player} />
      <Armor health={player.state.health} armor={player.state.armor} helmet={player.state.helmet} />
      <Defuse player={player} />

      {primary && <Weapon weapon={primary.name} active={primary.state === "active"} className="primary-weapon" />}
      {secondary && <Weapon weapon={secondary.name} active={secondary.state === "active"} className="secondary-weapon" />}

      {zeus ? <Weapon className={`zeus ${player.team.orientation}`} weapon="taser" active={zeus.state === "active"} /> : null}
      <div className="grenades">
        {grenades.map((grenade, index) => (
          <React.Fragment key={`${player.steamid}_${grenade.name}_${grenade.state}_${index}`}>
            <Weapon weapon={grenade.name} active={grenade.state === "active"} isGrenade />
            {grenade.ammo_reserve === 2 ? <Weapon weapon={grenade.name} active={false} isGrenade /> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="secondary_weapon">{primary && secondary ? <Weapon weapon={secondary.name} active={secondary.state === "active"} /> : ""}</div>
      <div className="player-health-bar" style={{ width: `${player.state.health}%` }}>
        <HexPattern size={20} gap={4} strokeWidth={1} strokeColor="rgba(255,255,255,1)" opacity={0.5} className="hex"/>
      </div>
      <div className="player-bg"></div>
    </div>
  );
}

const arePropsEqual = (prevProps: Readonly<IProps>, nextProps: Readonly<IProps>) => {
  if (prevProps.isObserved !== nextProps.isObserved) return false;
  if (prevProps.roundPhase !== nextProps.roundPhase) return false;

  return arePlayersEqual(prevProps.player, nextProps.player);
}

export default React.memo(Player, arePropsEqual);
//export default Player;
