import * as I from "csgogsi";
import TeamLogo from "../MatchBar/TeamLogo";
import "./mapseries.scss";
import { Match, Veto } from "../../API/types";

interface IProps {
  match: Match | null;
  teams: I.Team[];
  isFreezetime: boolean;
  map: I.Map;
}

interface IVetoProps {
  veto: Veto;
  teams: I.Team[];
  active: boolean;
  type: "ban" | "pick" | "decider";
}

const formatMapLabel = (mapName: string) =>
  mapName
    .replace(/^de_/i, "")
    .replace(/^cs_/i, "")
    .replace(/_/g, " ")
    .toUpperCase();

const getScoreLabel = (score?: Veto["score"]) => {
  if (!score) return "— : —";
  const values = Object.values(score);
  if (values.length < 2) return "— : —";
  return `${values[0]} : ${values[1]}`;
};

const VetoEntry = ({ veto, teams, active, type }: IVetoProps) => {
  const picker = teams.find((team) => team.id === veto.teamId) || null;
  const winner = teams.find((team) => team.id === veto.winner) || null;
  let vetoType = "Pick";
  if (veto.type === "decider") vetoType = "Decider";
  if (veto.type === "ban") vetoType = "Ban";

  const matchOver = veto.score !== undefined;

  return (
    <div className={`veto-container ${type}`}>
      <div className="veto-map-name">
        {formatMapLabel(veto.mapName)}
        <div className="veto-pick">{vetoType}</div>
      </div>
      <div className="separator"></div>
      <div className="veto-type-chip">
        {veto.type !== "decider" && <span>by</span>}
        {picker?.name || ""}
        {veto.type === "decider" && <div>KNIFE ROUND</div>}
      </div>
      {veto.type == "pick" && <><div className="separator"></div>
      <div className="side">
        {veto.side}
      </div>
      </>}
      {(matchOver && veto.type == "pick") && <><div className="fill"></div><div className="separator"></div><div className="veto-score">{getScoreLabel(veto.score)}</div></>}
    </div>
  );
};

const MapSeries = ({ match, teams, isFreezetime, map }: IProps) => {
  if (!match || !match.vetos.length) return null;
  return (
    <div className={`map_series_container ${isFreezetime ? "show" : "hide"}`}>
      <div className="title-bar">
        VETO OVERVIEW
      </div>
      {match.vetos
        .map((veto) => {
          console.log(veto);
          if (!veto.mapName) return null;
          return (
            <VetoEntry
              key={`${match.id}${veto.mapName}${veto.teamId}${veto.side}`}
              veto={veto}
              teams={teams}
              type={veto.type}
              active={map.name.includes(veto.mapName)}
            />
          );
        })}
    </div>
  );
};
export default MapSeries;
