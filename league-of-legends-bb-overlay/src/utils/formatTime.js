/**
 * Format seconds as MM:SS for positive elapsed time (game clock style).
 * @param {number} time - seconds (fractional values are floored for display)
 * @param {string} [whenNonPositive="LIVE"] - shown when time is not finite or ≤ 0 (legacy overlay behavior for 0 / -1)
 */
export function formatTime(time, whenNonPositive = "LIVE") {
  const t = Number(time);
  if (!Number.isFinite(t) || t <= 0) {
    return whenNonPositive;
  }

  const minutes = Math.floor(t / 60);
  const seconds = Math.floor(t % 60);

  if (minutes > 0) {
    return (
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (seconds < 10 ? "0" : "") +
      seconds
    );
  }
  return "00:" + (seconds < 10 ? "0" : "") + seconds;
}
