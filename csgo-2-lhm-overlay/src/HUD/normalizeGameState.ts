import { CSGO } from "csgogsi";

export const normalizeGameState = (game: CSGO): CSGO => {
  const mapName = game.map?.name || "";
  const normalizedMapName = mapName.substring(mapName.lastIndexOf("/") + 1) || mapName;

  return {
    ...game,
    map: {
      ...game.map,
      // Keep only the visible map id for UI widgets.
      name: normalizedMapName,
    },
    players: game.players || [],
    grenades: game.grenades || [],
  };
};
