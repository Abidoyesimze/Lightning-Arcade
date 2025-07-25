import  { useState } from 'react';
import { TrophyIcon, UserIcon, ChartBarIcon, BoltIcon } from '@heroicons/react/24/outline';

const games = [
  { label: 'Speed Clicker', value: 'speed-clicker', icon: <BoltIcon className="w-5 h-5 text-blue-400" /> },
  { label: 'Memory Chain', value: 'memory-chain', icon: <ChartBarIcon className="w-5 h-5 text-purple-400" /> },
  { label: 'Word Blitz', value: 'word-blitz', icon: <TrophyIcon className="w-5 h-5 text-green-400" /> },
  { label: 'Reaction Time', value: 'reaction-time', icon: <ChartBarIcon className="w-5 h-5 text-yellow-400" /> },
  { label: 'Number Ninja', value: 'number-ninja', icon: <ChartBarIcon className="w-5 h-5 text-red-400" /> },
  { label: 'Pattern Samurai', value: 'pattern-samurai', icon: <ChartBarIcon className="w-5 h-5 text-indigo-400" /> },
];

const leaderboardData = [
  { rank: 1, address: '0x1234...abcd', score: 1200 },
  { rank: 2, address: '0x5678...efgh', score: 1100 },
  { rank: 3, address: '0x9abc...def0', score: 950 },
  { rank: 4, address: '0x1111...2222', score: 900 },
  { rank: 5, address: '0x3333...4444', score: 850 },
];

const Leaderboard = () => {
  const [selectedGame, setSelectedGame] = useState(games[0].value);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold font-gaming text-white mb-2 flex items-center justify-center gap-2">
            <TrophyIcon className="w-10 h-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-lg text-gray-300">Top players across all Lightning Arcade games</p>
        </div>
        {/* Game Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {games.map((game) => (
            <button
              key={game.value}
              onClick={() => setSelectedGame(game.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 border-2 text-sm
                ${selectedGame === game.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500'
                  : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:text-white'}
              `}
            >
              {game.icon}
              {game.label}
            </button>
          ))}
        </div>
        {/* Leaderboard Table */}
        <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-900/80 border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {leaderboardData.map((entry) => (
                <tr key={entry.rank} className="hover:bg-blue-500/10 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-400">#{entry.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-white">{entry.address}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-green-400">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center text-gray-400 text-xs mt-4">Data is for demo purposes. Connect to blockchain for live stats.</div>
      </div>
    </div>
  );
};

export default Leaderboard; 