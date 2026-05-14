import { useState } from "react";
import TeamBox from "./../Players/TeamBox";
import PlayersAlive from "./../Players/PlayersAlive";
import MatchBar from "../MatchBar/MatchBar";
import SeriesBox from "../MatchBar/SeriesBox";
import Observed from "./../Players/Observed";
import RadarMaps from "./../Radar/RadarMaps";
import Trivia from "../Trivia/Trivia";
import SideBox from '../SideBoxes/SideBox';
import MoneyBox from '../SideBoxes/Money';
import UtilityLevel from '../SideBoxes/UtilityLevel';
import Killfeed from "../Killfeed/Killfeed";
import MapSeries from "../MapSeries/MapSeries";
import Overview from "../Overview/Overview";
import Tournament from "../Tournament/Tournament";
import Pause from "../PauseTimeout/Pause";
import Timeout from "../PauseTimeout/Timeout";
import RoundWinBanner from "./RoundWinBanner";
import { CSGO } from "csgogsi";
import { Match } from "../../API/types";
import { useAction, useConfig } from "../../API/contexts/actions";
import { Scout } from "../Scout";

interface Props {
  game: CSGO,
  match: Match | null
}
/*
interface State {
  winner: Team | null,
  showWin: boolean,
  forceHide: boolean
}*/

const Layout = ({game,match}: Props) => {
  const [ forceHide, setForceHide ] = useState(false);
  const layoutSettings = useConfig("layout_settings");

  useAction('boxesState', (state) => {
    if (state === "show") {
       setForceHide(false);
    } else if (state === "hide") {
      setForceHide(true);
    }
  });

  const left = game.map.team_ct.orientation === "left" ? game.map.team_ct : game.map.team_t;
  const right = game.map.team_ct.orientation === "left" ? game.map.team_t : game.map.team_ct;

  const leftPlayers = game.players.filter(player => player.team.side === left.side);
  const rightPlayers = game.players.filter(player => player.team.side === right.side);
  const phase = game.phase_countdowns.phase;
  const isFreezetime = (game.round && game.round.phase === "freezetime") || phase === "freezetime";
  const isBombPhase = game.round?.bomb === "planted" || phase === "bomb" || game.bomb?.state === "planted" || game.bomb?.state === "defusing";
  const isLivePhase = (game.round?.phase === "live" || phase === "live") && !isBombPhase;

  const cleanFeed = !!layoutSettings?.clean_feed;
  const layoutMode = layoutSettings?.layout_mode || "standard";

  // Phase-driven visibility profile.
  const showEconomyPanels = isFreezetime && !forceHide;
  const showKillfeed = !cleanFeed && (isLivePhase || isBombPhase);
  const showOverview = !cleanFeed;
  const showScout = !cleanFeed;
  const showTournament = !cleanFeed;
  const showTrivia = !cleanFeed;
  const showMapSeries = !cleanFeed && isFreezetime;
  const showSeriesBox = !cleanFeed;

  const layoutClasses = `layout overlay-theme-2026 layout-mode-${layoutMode} ${cleanFeed ? "layout-clean-feed" : ""} ${
    isBombPhase ? "phase-bomb" : isFreezetime ? "phase-freezetime" : "phase-live"
  }`;

  return (
    <div className={layoutClasses}>
      {showKillfeed ? <Killfeed /> : null}
      <PlayersAlive game={game} />
      {showOverview ? <Overview match={match} map={game.map} players={game.players || []} /> : null}
      <RadarMaps match={match} map={game.map} game={game} />
      <MatchBar map={game.map} phase={game.phase_countdowns} bomb={game.bomb} match={match} />
      <RoundWinBanner />
      <Pause  phase={game.phase_countdowns}/>
      <Timeout map={game.map} phase={game.phase_countdowns} />
      {showSeriesBox ? <SeriesBox map={game.map} match={match} /> : null}

      {showTournament ? <Tournament /> : null}

      <Observed player={game.player} game={game} />

      <TeamBox team={left} players={leftPlayers} side="left" current={game.player} />
      <TeamBox team={right} players={rightPlayers} side="right" current={game.player} />


      <MapSeries teams={[left, right]} match={match} isFreezetime={isFreezetime} map={game.map} />

      <div className={"boxes left"}>
        <UtilityLevel side={left.side} players={game.players} show={showEconomyPanels} />
        <SideBox side="left" hide={forceHide} />
        <MoneyBox
          team={left.side}
          side="left"
          loss={Math.min(left.consecutive_round_losses * 500 + 1400, 3400)}
          equipment={leftPlayers.map(player => player.state.equip_value).reduce((pre, now) => pre + now, 0)}
          money={leftPlayers.map(player => player.state.money).reduce((pre, now) => pre + now, 0)}
          show={showEconomyPanels}
        />
      </div>
      <div className={"boxes right"}>
        <UtilityLevel side={right.side} players={game.players} show={showEconomyPanels} />
        <SideBox side="right" hide={forceHide} />
        <MoneyBox
          team={right.side}
          side="right"
          loss={Math.min(right.consecutive_round_losses * 500 + 1400, 3400)}
          equipment={rightPlayers.map(player => player.state.equip_value).reduce((pre, now) => pre + now, 0)}
          money={rightPlayers.map(player => player.state.money).reduce((pre, now) => pre + now, 0)}
          show={showEconomyPanels}
        />
      </div>
    </div>
  );
}
export default Layout;
