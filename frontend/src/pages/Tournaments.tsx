
import { TrophyIcon, UserGroupIcon, ClockIcon, CurrencyDollarIcon, CheckIcon } from '@heroicons/react/24/outline';

const tournaments = [
  {
    id: 1,
    name: 'Lightning Cup',
    type: 'SPEED_CHAMPIONSHIP',
    startTime: '2025-07-25 18:00',
    duration: '2h',
    entryFee: '0.01 ETH',
    maxParticipants: 100,
    participants: 87,
    prizePool: '1.0 ETH',
    isActive: true,
    isFinished: false,
    winner: null,
  },
  {
    id: 2,
    name: 'Memory Masters',
    type: 'DAILY_CHALLENGE',
    startTime: '2025-07-26 20:00',
    duration: '1h',
    entryFee: '0.005 ETH',
    maxParticipants: 50,
    participants: 32,
    prizePool: '0.25 ETH',
    isActive: false,
    isFinished: false,
    winner: null,
  },
  {
    id: 3,
    name: 'Grand Tournament',
    type: 'GRAND_TOURNAMENT',
    startTime: '2025-07-30 17:00',
    duration: '4h',
    entryFee: '0.05 ETH',
    maxParticipants: 500,
    participants: 420,
    prizePool: '10 ETH',
    isActive: false,
    isFinished: true,
    winner: '0x1234...abcd',
  },
];

const Tournaments = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold font-gaming text-white mb-2 flex items-center justify-center gap-2">
          <TrophyIcon className="w-10 h-10 text-yellow-400" />
          Tournaments
        </h1>
        <p className="text-lg text-gray-300">Compete in epic tournaments and win big prizes!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((t) => (
          <div key={t.id} className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrophyIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-xl font-bold text-white">{t.name}</span>
                <span className="ml-auto px-3 py-1 rounded-lg text-xs font-medium border border-gray-700/50 bg-gray-800/50 text-gray-300">
                  {t.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-400">
                <div className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {t.startTime}</div>
                <div className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4" /> {t.participants}/{t.maxParticipants}</div>
                <div className="flex items-center gap-1"><CurrencyDollarIcon className="w-4 h-4" /> {t.entryFee}</div>
                <div className="flex items-center gap-1"><TrophyIcon className="w-4 h-4" /> {t.prizePool}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {t.isFinished && t.winner ? (
                <span className="flex items-center gap-1 text-green-400 font-bold"><CheckIcon className="w-5 h-5" /> Winner: {t.winner}</span>
              ) : t.isActive ? (
                <button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg">Join Now</button>
              ) : (
                <button className="flex-1 bg-gray-700/50 text-gray-400 font-semibold py-2 px-4 rounded-lg cursor-not-allowed">Not Started</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center text-gray-400 text-xs mt-4">Data is for demo purposes. Connect to blockchain for live tournaments.</div>
    </div>
  </div>
);

export default Tournaments; 