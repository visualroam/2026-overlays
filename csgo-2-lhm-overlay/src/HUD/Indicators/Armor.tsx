import React from "react";
import { ArmorFull, ArmorHelmet } from "./../../assets/Icons";

const Armor = ({ health, armor, helmet }: { health: number, armor: number, helmet: boolean }) => {
  if (!health || !armor) return null;
  return (
    <div className={`armor-indicator`}>
      {helmet ? <ArmorHelmet height="25px" width="25px" /> : <ArmorFull height="25px" width="25px" />}
    </div>
  );
};

export default React.memo(Armor);
