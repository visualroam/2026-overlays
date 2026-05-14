import "./Settings.scss";
import { useBlueBottleContext } from "../overlays/BlueBottle";

export const Settings = () => {
  const { isConnected: blueBottleConnected, wsUrl } = useBlueBottleContext();

  return (
    <div className="container-fluid">
      <div className="row blue-bottle-header">
        <div className="col-12 col-lg-6">
          <a href="https://bluebottle.gg">
            <img
              src="https://bluebottle.gg/wp-content/uploads/2024/12/Logo_BlueBottle.svg"
              alt="BlueBottle"
              className="blue-bottle-logo"
            />
          </a>
        </div>
        <div className="col-12 col-lg-6 d-flex justify-content-end align-items-center blue-bottle-header-text">
          Overlay (no backend)
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-12 col-lg-8">
          <p className="mb-2">
            <strong>BlueBottle</strong> WebSocket:{" "}
            <code className="user-select-all">{wsUrl}</code>
          </p>
          <p className="small text-muted mb-2">
            Override host with <code>?blueBottleAddress=127.0.0.1</code>, port with{" "}
            <code>?blueBottlePort=58869</code> or <code>?port=58869</code>.
          </p>
        </div>
        <div className="col-12 col-lg-4 d-flex justify-content-end align-items-start">
          <ConnectStatus connected={blueBottleConnected} label="BlueBottle" />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <h6 className="text-muted">League — theme in URL</h6>
          <a
            href="/overlay/league_of_legends/ingame/theme/default"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary me-2 mb-2"
          >
            In-game (default)
          </a>
          <a
            href="/overlay/league_of_legends/ingame/theme/a1esports"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary me-2 mb-2"
          >
            In-game (a1esports)
          </a>
          <a
            href="/overlay/league_of_legends/ingame/theme/2026-v1"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary me-2 mb-2"
          >
            In-game (2026-v1)
          </a>
          <a
            href="/overlay/league_of_legends/pickban/theme/default"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary me-2 mb-2"
          >
            Pick &amp; ban (default)
          </a>
          <a
            href="/overlay/league_of_legends/pickban/theme/a1esports"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary me-2 mb-2"
          >
            Pick &amp; ban (a1esports)
          </a>
          <a
            href="/overlay/league_of_legends/pickban/theme/2026-v1"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary me-2 mb-2"
          >
            Pick &amp; ban (2026-v1)
          </a>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-12">
          <small className="text-muted">
            Add query params to overlay URLs (e.g.{" "}
            <code>?blueBottlePort=58869&amp;blueBottleAddress=127.0.0.1</code>).
          </small>
        </div>
      </div>
    </div>
  );
};

const ConnectStatus = ({ connected, label }) => {
  return (
    <div
      className={`connect-status ${connected ? "connected" : "disconnected"}`}
    >
      {connected ? <i className="fal fa-check" /> : <i className="fal fa-times" />}
      <div className="connect-status-text">{label}</div>
    </div>
  );
};
