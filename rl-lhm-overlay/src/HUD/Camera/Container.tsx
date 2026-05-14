import React from "react";
import PlayerCamera from "./Camera";



const CameraContainer = ({ observedSteamid, players }: { observedSteamid: string | null, players: string[] }) => {
    return <div id="cameras-container">
        {
            players.map(steamid => (<PlayerCamera key={steamid} steamid={steamid} visible={observedSteamid === steamid} />))
        }
    </div>
}

export default CameraContainer;
