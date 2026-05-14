import Player from './Player'
import * as I from 'csgogsi';
import './players.scss';

interface Props {
  players: I.Player[],
  team: I.Team,
  side: 'right' | 'left',
  current: I.Player | null,
}
const TeamBox = ({players, team, side, current}: Props) => {
  const sortedPlayers = [...players].sort((a, b) => {
    const slotA = a.observer_slot ?? Number.MAX_SAFE_INTEGER;
    const slotB = b.observer_slot ?? Number.MAX_SAFE_INTEGER;
    return slotA - slotB;
  });

  return (
    <div className={`teambox ${team.side} ${side}`}>
      {sortedPlayers.map(player => <Player
        key={player.steamid}
        player={player}
        isObserved={!!(current && current.steamid === player.steamid)}
      />)}
    </div>
  );
}
export default TeamBox;