import { useState } from "react";
import "./radar.scss";
import { Match, Veto } from "../../API/types";
import { Map, CSGO, Team } from 'csgogsi';
import Radar from './Radar'

import { useAction, useConfig } from "../../API/contexts/actions";

interface Props { match: Match | null, map: Map, game: CSGO }
const MIN_RADAR_SIZE = 260;
const MAX_RADAR_SIZE = 700;
const clampRadarSize = (size: number) => Math.max(MIN_RADAR_SIZE, Math.min(MAX_RADAR_SIZE, size));

 const RadarMaps = ({ match, map, game }: Props) => {
    const [ radarSize, setRadarSize ] = useState(366);
    const [ showBig, setShowBig ] = useState(false);
    const [ reducedDetail, setReducedDetail ] = useState(false);
    const layoutSettings = useConfig("layout_settings");

    useAction('radarBigger', () => {
        setRadarSize(p => clampRadarSize(p + 10));
    }, []);

    useAction('radarSmaller', () => {
        setRadarSize(p => clampRadarSize(p - 10));
    }, []);

    useAction('toggleRadarView', () => {
        setShowBig(p => !p);
    }, []);

    useAction("toggleRadarDetail", () => {
        setReducedDetail((p) => !p);
    }, []);

    const radarMode = layoutSettings?.radar_mode || "default";
    const sizeByMode = radarMode === "mini" ? 300 : radarMode === "focus" ? 600 : radarSize;
    const effectiveSize = clampRadarSize(showBig ? 600 : sizeByMode);

    return (
        <div id={`radar_maps_container`} className={` ${showBig || radarMode === "focus" ? 'preview':''}`}>
            {match ? <MapsBar match={match} map={map} game={game} /> : null}
            <Radar radarSize={effectiveSize} game={game} reducedDetail={reducedDetail || layoutSettings?.feed_density === "compact"} />
        </div>
    );
}

export default RadarMaps;

const MapsBar = ({ match, map }: Props) => {
    if (!match || !match.vetos.length) return '';
    const picks = match.vetos.filter(veto => veto.type !== "ban" && veto.mapName);
    if (picks.length > 3) {
        const current = picks.find(veto => map.name.includes(veto.mapName));
        if (!current) return null;
        return <div id="maps_container">
            <div className="bestof">Best of {match.matchType.replace("bo", "")}</div>
            {<MapEntry veto={current} map={map} team={current.type === "decider" ? null : map.team_ct.id === current.teamId ? map.team_ct : map.team_t} />}
        </div>
    }
    return <div id="maps_container">
    <div className="bestof">Best of {match.matchType.replace("bo", "")}</div>
        {match.vetos.filter(veto => veto.type !== "ban").filter(veto => veto.teamId || veto.type === "decider").map(veto => <MapEntry key={veto.mapName} veto={veto} map={map} team={veto.type === "decider" ? null : map.team_ct.id === veto.teamId ? map.team_ct : map.team_t} />)}
    </div>
}

const MapEntry = ({ veto, map }: { veto: Veto, map: Map, team: Team | null }) => {
    return <div className="veto_entry">
        <div className={`map_name ${map.name.includes(veto.mapName) ? 'active' : ''}`}>{veto.mapName.replace("de_", "")}</div>
    </div>
}