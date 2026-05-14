import { useBlueBottleContext } from "../../BlueBottle";
import { useMemo, useEffect } from "react";
import { useParams } from "react-router";
import IngameThemeDefault from "./themes/Default";
import IngameThemeA1eSports from "./themes/a1esports/a1esports";
import Ingame2026V1 from "./themes/2026-v1/Ingame2026V1";
import { createDefaultIntegration } from "../../../utils/defaultIntegration";

const Ingame = () => {
  const { theme: themeParam } = useParams();
  const theme = themeParam || "default";

  const { isConnected: blueBottleConnected, ingameState: state } =
    useBlueBottleContext();

  const integration = useMemo(
    () => createDefaultIntegration(theme),
    [theme]
  );

  if (!blueBottleConnected) {
    return null;
  }

  if (theme === "default") {
    return (
      <div>
        <IngameThemeDefault state={state} integration={integration} />
      </div>
    );
  }

  if (theme === "a1esports" || theme === "a1esports2") {
    return (
      <div>
        <IngameThemeA1eSports state={state} integration={integration} />
      </div>
    );
  }

  if (theme === "2026-v1") {
    return <Ingame2026V1 />;
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bs-red)",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: "2rem",
      }}
    >
      Invalid theme: &apos;{theme}&apos;
    </div>
  );
};

export default Ingame;
