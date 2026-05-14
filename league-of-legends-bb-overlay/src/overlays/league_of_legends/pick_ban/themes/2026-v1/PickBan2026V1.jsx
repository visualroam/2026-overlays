import { PickBan2026V1Theme } from "./PickBan2026V1Theme";
import "./2026-v1.scss";

/** 2026-v1 pick/ban: fork of default theme + `pickbanLayout` query (see PickBan2026V1Theme.jsx). */
export function PickBan2026V1({ state, integration }) {
  return (
    <div className="pickban-root-theme-2026-v1">
      <PickBan2026V1Theme state={state} integration={integration} />
    </div>
  );
}
