import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router";
import { BlueBottleProvider } from "./overlays/BlueBottle";
import { Settings } from "./settings/Settings";
import Ingame from "./overlays/league_of_legends/ingame/Ingame";
import PickAndBan from "./overlays/league_of_legends/pick_ban/PickBan";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route
            path="/"
            element={
              <BlueBottleProvider wsPath="/ws/in">
                <Settings />
              </BlueBottleProvider>
            }
          />
          <Route
            path="/overlay/league_of_legends/ingame/theme/:theme"
            element={
              <BlueBottleProvider wsPath="/ws/in">
                <Ingame />
              </BlueBottleProvider>
            }
          />
          <Route
            path="/overlay/league_of_legends/pickban/theme/:theme"
            element={
              <BlueBottleProvider wsPath="/ws/pre">
                <PickAndBan />
              </BlueBottleProvider>
            }
          />
          <Route
            path="/overlay/league/ingame"
            element={
              <Navigate to="/overlay/league_of_legends/ingame/theme/default" replace />
            }
          />
          <Route
            path="/overlay/league/pickban"
            element={
              <Navigate to="/overlay/league_of_legends/pickban/theme/default" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
