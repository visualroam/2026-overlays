import { useEffect, useState } from "react";
import api from "..";
import { socket } from "../socket";
import { GSI } from "../HUD";
import { Match } from "../types";

const getCurrentMapName = () => {
  const mapName = GSI.last?.map?.name || "";
  if (!mapName) return null;
  return mapName.substring(mapName.lastIndexOf("/") + 1);
};

const clearTeams = () => {
  GSI.teams.left = null;
  GSI.teams.right = null;
};

export const useMatchData = () => {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    const assignTeamsForMatch = (nextMatch: Match) => {
      const currentMapName = getCurrentMapName();
      const isReversed = !!(
        currentMapName &&
        nextMatch.vetos.find(
          (veto) => veto.mapName === currentMapName && veto.reverseSide
        )
      );

      if (nextMatch.left.id) {
        api.teams
          .getOne(nextMatch.left.id)
          .then((left) => {
            const gsiTeamData = {
              id: left._id,
              name: left.name,
              country: left.country,
              logo: left.logo,
              map_score: nextMatch.left.wins,
              extra: left.extra,
            };
            if (isReversed) GSI.teams.right = gsiTeamData;
            else GSI.teams.left = gsiTeamData;
          })
          .catch(() => {});
      }

      if (nextMatch.right.id) {
        api.teams
          .getOne(nextMatch.right.id)
          .then((right) => {
            const gsiTeamData = {
              id: right._id,
              name: right.name,
              country: right.country,
              logo: right.logo,
              map_score: nextMatch.right.wins,
              extra: right.extra,
            };
            if (isReversed) GSI.teams.left = gsiTeamData;
            else GSI.teams.right = gsiTeamData;
          })
          .catch(() => {});
      }
    };

    const onMatchPing = () => {
      api.match
        .getCurrent()
        .then((nextMatch) => {
          if (!nextMatch) {
            clearTeams();
            setMatch(null);
            return;
          }

          setMatch(nextMatch);
          assignTeamsForMatch(nextMatch);
        })
        .catch(() => {
          clearTeams();
          setMatch(null);
        });
    };

    socket.on("match", onMatchPing);
    onMatchPing();

    return () => {
      socket.off("match", onMatchPing);
    };
  }, []);

  return match;
};
