
import { UserIcon, TrophyIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline';

const playerAddress = '0x1234...abcd';
const stats = [
  { label: 'Games Played', value: 42, icon: <BoltIcon className="w-5 h-5 text-blue-400" /> },
  { label: 'Total Prizes', value: '2.5 ETH', icon: <TrophyIcon className="w-5 h-5 text-yellow-400" /> },
  { label: 'Badges', value: 7, icon: <StarIcon className="w-5 h-5 text-purple-400" /> },
];
const badges = [
  { name: 'Pioneer', rarity: 'Legendary', image: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500' },
  { name: 'Speedster', rarity: 'Epic', image: 'https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500' },
  { name: 'Memory Master', rarity: 'Rare', image: 'https://tailwindui.com/img/logos/mark.svg?color=yellow&shade=500' },
  { name: 'Word Wizard', rarity: 'Common', image: 'https://tailwindui.com/img/logos/mark.svg?color=green&shade=500' },
];
const recentGames = [
  { game: 'Speed Clicker', score: 1200, date: '2025-07-20' },
  { game: 'Memory Chain', score: 950, date: '2025-07-18' },
  { game: 'Word Blitz', score: 800, date: '2025-07-15' },
];

const Profile = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
          <UserIcon className="w-12 h-12 text-white" />
        </div>
        <div className="font-mono text-lg text-blue-400 mb-2">{playerAddress}</div>
        <div className="flex gap-4 mb-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2">
              {stat.icon}
              <div className="font-bold text-white text-lg">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Badges */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><StarIcon className="w-6 h-6 text-yellow-400" /> Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.name} className="flex flex-col items-center bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 shadow-md">
              <img src={badge.image} alt={badge.name} className="w-12 h-12 mb-2 rounded-full border-2 border-purple-400" />
              <div className="font-bold text-white">{badge.name}</div>
              <div className="text-xs text-purple-400">{badge.rarity}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Games */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BoltIcon className="w-6 h-6 text-blue-400" /> Recent Games</h2>
        <div className="overflow-x-auto rounded-xl shadow-lg bg-gray-900/80 border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Game</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentGames.map((g, i) => (
                <tr key={i} className="hover:bg-purple-500/10 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap text-white font-bold">{g.game}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-400 font-bold">{g.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{g.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-center text-gray-400 text-xs mt-4">Data is for demo purposes. Connect to blockchain for live stats.</div>
    </div>
  </div>
);

export default Profile; 