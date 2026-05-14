import { useBlueBottleContext } from "../../BlueBottle";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { PickAndBanDefaultTheme } from "./themes/Default";
import { A1eSportsPickBan } from "./themes/a1esports/A1esports";
import { A1eSportsPickBan2 } from "./themes/a1esports2/A1esports";
import { PickBan2026V1 } from "./themes/2026-v1/PickBan2026V1";
import { createDefaultIntegration } from "../../../utils/defaultIntegration";

const PickAndBan = () => {
  const { theme: themeParam } = useParams();
  const theme = themeParam || "default";

  const {
    isConnected: blueBottleConnected,
    championSelectState,
    port,
  } = useBlueBottleContext();

  const state = championSelectState ?? {};

  useEffect(() => {
    window.blueBottlePort = port;
  }, [port]);

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
        <PickAndBanDefaultTheme state={state} integration={integration} />
      </div>
    );
  }

  if (theme === "a1esports") {
    return (
      <div>
        <A1eSportsPickBan state={state} integration={integration} />
      </div>
    );
  }

  if (theme === "a1esports2") {
    return (
      <div>
        <A1eSportsPickBan2 state={state} integration={integration} />
      </div>
    );
  }

  if (theme === "2026-v1") {
    return (
      <div>
        <PickBan2026V1 state={state} integration={integration} />
      </div>
    );
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

export default PickAndBan;
