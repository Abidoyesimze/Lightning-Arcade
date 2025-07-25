import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GameLobby from './components/games/GameLobby';
import Game from './components/games/Games';

// Placeholder imports for missing pages
import Tournaments from './pages/Tournaments';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<GameLobby />} />
        <Route path="/game/:gameType/:gameId" element={<Game />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
