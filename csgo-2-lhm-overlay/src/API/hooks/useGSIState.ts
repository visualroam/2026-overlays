import { useEffect, useState } from "react";
import { CSGO } from "csgogsi";
import { GSI } from "../HUD";

export const useGSIState = () => {
  const [game, setGame] = useState<CSGO | null>(null);

  useEffect(() => {
    const onData = (data: CSGO) => {
      setGame(data);
    };

    GSI.on("data", onData);
    return () => {
      GSI.off("data", onData);
    };
  }, []);

  return game;
};
