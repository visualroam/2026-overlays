import { getBlueBottleAddress, getBlueBottlePort } from "./server_address";

/** Asset URLs served by BlueBottle HTTP (same host as overlay, or `blueBottleAddress` when remote). */
export function getImagePath(path) {
  const { hostname } = window.location;
  const address = getBlueBottleAddress();
  if (!path) return null;
  const port = getBlueBottlePort();
  if (address && address !== hostname) {
    return `http://${address}:${port}/${path}`;
  }
  return `http://${hostname}:${port}/${path}`;
}
