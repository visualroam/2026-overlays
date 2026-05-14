/**
 * Format raw League gold as thousands (e.g. for display with a trailing "K").
 * @param {number} gold - raw gold amount
 * @param {number} [decimals=1] - fraction digits after dividing by 1000 (clamped 0–20 for `toFixed`)
 */
export function formatGold(gold, decimals = 1) {
  const n = Number(gold);
  const d = Math.min(20, Math.max(0, Math.floor(Number(decimals)) || 0));
  if (!Number.isFinite(n)) {
    return (0).toFixed(d);
  }
  return (n / 1000).toFixed(d);
}
