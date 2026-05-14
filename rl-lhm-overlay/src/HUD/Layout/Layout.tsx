import React, { useEffect, useState } from "react";

import TopBox from "../TopBox";
import TeamBox from "../TeamBox";
import ObservedPlayerBox from "../ObservedPlayerBox";
import { Player, StatfeedEvent } from "../../lhm-rl-module";

import "./Layout.scss";
import Scoreboard from "../Scoreboard";
import Trivia from "../Trivia/Trivia";
import { WhepStreamsProvider } from "../Camera/whepStreams";

enum MatchStates {
  InProgress,
  PostGame,
}

interface Props {
  game: any;
  ballHit: any;
  players: any;
  teams: any;
  isReplay: boolean;
  isOvertime: boolean;
  statfeedEvents: StatfeedEvent[];
  matchState: MatchStates;
  bestOf?: string;
  showObserved: boolean;
}

const Layout = (props: Props) => {
  const {
    game,
    ballHit,
    players,
    teams,
    isReplay,
    statfeedEvents,
    isOvertime,
    bestOf,
    showObserved,
  } = props;

  const [lastObservedPlayer, setLastObservedPlayer] = useState<Player | null>(
    null
  );

  useEffect(() => {
    if (game?.target) {
      const p: Player = players?.find((p: Player) => p.id === game?.target);
      if (p) {
        setLastObservedPlayer(p);
      }
    }
  }, [game?.target, players]);

  if (!props.game) return null;

  const steamids =
    players?.filter((p: Player) => p.steamid)?.map((p: Player) => p.steamid) ||
    ([] as string[]);

  // Replay state can come either from the replay_start/end events (props.isReplay)
  // or directly from the game state (game.isReplay) — use either.
  const replayActive = !!isReplay || !!game?.isReplay;

  return (
    <WhepStreamsProvider>
    <div className="layout overlay-theme-2026">
      <div className={`replay-frame ${replayActive ? "show" : "hide"}`}>
        <div className="replay-frame__edge replay-frame__edge--top" />
        <div className="replay-frame__edge replay-frame__edge--right" />
        <div className="replay-frame__edge replay-frame__edge--bottom" />
        <div className="replay-frame__edge replay-frame__edge--left" />

        <div className="replay-frame__corner replay-frame__corner--tl" />
        <div className="replay-frame__corner replay-frame__corner--tr" />
        <div className="replay-frame__corner replay-frame__corner--bl" />
        <div className="replay-frame__corner replay-frame__corner--br" />

        <div className="replay-frame__title">
          <div className="replay-dot" />
          <span>REPLAY</span>
        </div>
      </div>

      <Trivia />

      <TopBox
        time={game.time || game.time_seconds || game.time_milliseconds}
        blueScore={game.teams[0]?.score}
        orangeScore={game.teams[1]?.score}
        blueTeamName={teams.blue?.name}
        orangeTeamName={teams.orange?.name}
        blueTeamTag={teams.blue?.shortName}
        orangeTeamTag={teams.orange?.shortName}
        blueTeamId={teams.blue?.id}
        orangeTeamId={teams.orange?.id}
        blueMatchScore={teams.blue?.map_score}
        orangeMatchScore={teams.orange?.map_score}
        label={bestOf || game.arena?.replace(/_/g, " ")}
        isOvertime={isOvertime}
      />

      {props.matchState !== MatchStates.PostGame && (
        <>
          <TeamBox
            side="blue"
            lastBallHit={ballHit}
            players={players?.filter((p: Player) => p.team === 0)}
            statfeedEvents={statfeedEvents.filter(
              (e: StatfeedEvent) => e.main_target.team_num === 0
            )}
            observedId={game?.target || undefined}
          />
          <TeamBox
            side="orange"
            lastBallHit={ballHit}
            players={players?.filter((p: Player) => p.team === 1)}
            statfeedEvents={statfeedEvents.filter(
              (e: StatfeedEvent) => e.main_target.team_num === 1
            )}
            observedId={game?.target || undefined}
          />
        </>
      )}

      <ObservedPlayerBox
        player={lastObservedPlayer || undefined}
        show={showObserved && !!game?.target}
        steamids={steamids}
      />

      {(props.matchState === MatchStates.PostGame || false) && (
        <Scoreboard
          players={players}
          teams={teams}
          gameScore={{
            blue: game.teams?.[0]?.score ?? 0,
            orange: game.teams?.[1]?.score ?? 0,
          }}
          bestOf={bestOf}
          isOvertime={isOvertime}
        />
      )}
    </div>
    </WhepStreamsProvider>
  );
};

export default Layout;
