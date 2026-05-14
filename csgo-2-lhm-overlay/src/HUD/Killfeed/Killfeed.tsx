import React, { useRef, useState } from 'react';

import { KillEvent, Player } from 'csgogsi';
import Kill from './Kill';
import './killfeed.scss';
import { onGSI } from '../../API/contexts/actions';


export interface ExtendedKillEvent extends KillEvent {
    type: 'kill';
    id: string;
}

export interface BombEvent {
    player: Player;
    type: 'plant' | 'defuse';
    id: string;
}

const MAX_FEED_EVENTS = 8;

const Killfeed = () => {
    const [ events, setEvents ] = useState<(BombEvent | ExtendedKillEvent)[]>([]);
    const previousBombStateRef = useRef<string | null>(null);

    const pushEvent = (entry: BombEvent | ExtendedKillEvent) => {
        setEvents((ev) => [...ev, entry].slice(-MAX_FEED_EVENTS));
    };

    onGSI("kill", kill => {
        pushEvent({ ...kill, type: 'kill', id: `kill_${Date.now()}_${Math.random()}` });
    }, []);

    onGSI("data", data => {
        const currentBombState = data.bomb?.state || null;
        const previousBombState = previousBombStateRef.current;

        if (currentBombState === "planted" && previousBombState !== "planted" && data.bomb?.player) {
            pushEvent({
                id: `bomb_plant_${Date.now()}_${data.bomb.player.steamid}`,
                type: "plant",
                player: data.bomb.player,
            });
        }

        if (previousBombState === "defusing" && currentBombState !== "defusing" && data.round?.bomb === "defused" && data.bomb?.player) {
            pushEvent({
                id: `bomb_defuse_${Date.now()}_${data.bomb.player.steamid}`,
                type: "defuse",
                player: data.bomb.player,
            });
        }

        previousBombStateRef.current = currentBombState;

        if(data.round && data.round.phase === "freezetime"){
            if(Number(data.phase_countdowns.phase_ends_in) < 10 && events.length > 0){
                setEvents([]);
            }
        }
    }, []);

    return (
        <div className="killfeed">
            {events.map(event => <Kill key={event.id} event={event}/>)}
        </div>
    );

}

export default React.memo(Killfeed);
