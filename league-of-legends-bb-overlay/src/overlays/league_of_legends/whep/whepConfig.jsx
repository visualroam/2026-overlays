/**
 * WHEP cycler configuration. Edit this file to point each slot at a different
 * WHEP endpoint.
 *
 * Layout (drives <WhepCycler />):
 *   - Two on-screen positions, A and B.
 *   - Position A cycles through URLs 1..5 (the first array).
 *   - Position B cycles through URLs 6..10 (the second array).
 *   - Both positions advance together every WHEP_CYCLE_INTERVAL_MS.
 *     i.e. (1,6) -> (2,7) -> (3,8) -> (4,9) -> (5,10) -> back to (1,6).
 *
 * Notes:
 *   - Duplicates are de-duplicated when opening peer connections, so it is
 *     fine if multiple slots point at the same URL (e.g. the local default
 *     while you wire things up).
 *   - An empty string disables that slot.
 */

/** Default URL used to fill every slot until you replace them. */
export const DEFAULT_WHEP_URL = "http://127.0.0.1:8889/facecam/whep";

/** How long (ms) to hold each pair before advancing to the next one. */
export const WHEP_CYCLE_INTERVAL_MS = 15000;

/** Position A: cycles through these (slots 1..5). */
export const WHEP_POSITION_A_URLS = [
    DEFAULT_WHEP_URL, // 1
    DEFAULT_WHEP_URL, // 2
    DEFAULT_WHEP_URL, // 3
    DEFAULT_WHEP_URL, // 4
    DEFAULT_WHEP_URL, // 5
];

/** Position B: cycles through these (slots 6..10). */
export const WHEP_POSITION_B_URLS = [
    DEFAULT_WHEP_URL, // 6
    DEFAULT_WHEP_URL, // 7
    DEFAULT_WHEP_URL, // 8
    DEFAULT_WHEP_URL, // 9
    DEFAULT_WHEP_URL, // 10
];
