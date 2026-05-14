import './App.css'
import { SettingsProvider } from './API/contexts/actions'
import Layout from './HUD/Layout/Layout';
import './API/socket';
import { useGSIState } from './API/hooks/useGSIState';
import { useMatchData } from './API/hooks/useMatchData';
import { normalizeGameState } from './HUD/normalizeGameState';

function App() {
  const game = useGSIState();
  const match = useMatchData();

  if (!game) return null;
  const normalizedGame = normalizeGameState(game);

  return (
    <SettingsProvider>
      <Layout game={normalizedGame} match={match} />
    </SettingsProvider>
  );
}

export default App
