/**
 * Default overlay integration when no backend is used (theme comes from the URL).
 */
export function createDefaultIntegration(theme = "default") {
  return {
    theme,
    leagueOfLegends: {
      hud: {
        goldList: false,
        mode: "lane-phase",
        overlay: "hide",
        overlayNumber: 0,
        overlayJSON: {},
        gold: false,
        drakes: { blue: [], red: [] },
      },
      pickban: {
        index: 0,
        state: {},
        show: "show",
      },
    },
  };
}
