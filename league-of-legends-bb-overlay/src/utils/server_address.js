export const getBlueBottleAddress = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("blueBottleAddress") || window.location.hostname || "localhost";
};

/** BlueBottle HTTP/WebSocket port (query: `blueBottlePort` or `port`). Default 58869. */
export const getBlueBottlePort = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("blueBottlePort") ?? params.get("port");
  const n = raw !== null ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : 58869;
};

export const getLHMAddress = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("lhmAddress") || window.location.hostname || "localhost";
};
