import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  BoltIcon,
  FireIcon,
  StarIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  Medal,
  Crown,
  Zap,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';

const games = [
  { label: 'All Games', value: 'all', icon: <TrophyIcon className="w-5 h-5 text-yellow-400" /> },
  { label: 'Speed Clicker', value: 'speed-clicker', icon: <BoltIcon className="w-5 h-5 text-blue-400" /> },
  { label: 'Memory Chain', value: 'memory-chain', icon: <ChartBarIcon className="w-5 h-5 text-purple-400" /> },
  { label: 'Word Blitz', value: 'word-blitz', icon: <SparklesIcon className="w-5 h-5 text-green-400" /> },
  { label: 'Reaction Time', value: 'reaction-time', icon: <BoltIcon className="w-5 h-5 text-yellow-400" /> },
  { label: 'Number Ninja', value: 'number-ninja', icon: <ChartBarIcon className="w-5 h-5 text-red-400" /> },
  { label: 'Pattern Samurai', value: 'pattern-samurai', icon: <ChartBarIcon className="w-5 h-5 text-indigo-400" /> },
];

const timeframes = [
  { label: 'Daily', value: 'daily', icon: <ClockIcon className="w-4 h-4" /> },
  { label: 'Weekly', value: 'weekly', icon: <CalendarIcon className="w-4 h-4" /> },
  { label: 'Monthly', value: 'monthly', icon: <CalendarIcon className="w-4 h-4" /> },
  { label: 'All Time', value: 'all-time', icon: <TrophyIcon className="w-4 h-4" /> },
];

const leaderboardData = [
  { 
    rank: 1, 
    address: '0x1234...abcd', 
    username: 'SpeedDemon',
    score: 12450, 
    gamesPlayed: 342,
    winRate: 87,
    avgScore: 1205,
    streak: 15,
    level: 42,
    change: 0,
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  { 
    rank: 2, 
    address: '0x5678...efgh', 
    username: 'NinjaGamer',
    score: 11800, 
    gamesPlayed: 298,
    winRate: 82,
    avgScore: 1180,
    streak: 12,
    level: 38,
    change: 1,
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  { 
    rank: 3, 
    address: '0x9abc...def0', 
    username: 'ProPlayer99',
    score: 10950, 
    gamesPlayed: 276,
    winRate: 79,
    avgScore: 1095,
    streak: 8,
    level: 35,
    change: -1,
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  { 
    rank: 4, 
    address: '0x1111...2222', 
    username: 'QuickFingers',
    score: 9800, 
    gamesPlayed: 245,
    winRate: 75,
    avgScore: 980,
    streak: 6,
    level: 32,
    change: 2,
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  { 
    rank: 5, 
    address: '0x3333...4444', 
    username: 'MasterMind',
    score: 9250, 
    gamesPlayed: 231,
    winRate: 73,
    avgScore: 925,
    streak: 5,
    level: 30,
    change: -2,
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  { 
    rank: 6, 
    address: '0x5555...6666', 
    username: 'LightningFast',
    score: 8700, 
    gamesPlayed: 218,
    winRate: 70,
    avgScore: 870,
    streak: 4,
    level: 28,
    change: 0,
    avatar: 'https://i.pravatar.cc/150?img=6'
  },
  { 
    rank: 7, 
    address: '0x7777...8888', 
    username: 'ArcadeKing',
    score: 8200, 
    gamesPlayed: 205,
    winRate: 68,
    avgScore: 820,
    streak: 3,
    level: 26,
    change: 3,
    avatar: 'https://i.pravatar.cc/150?img=7'
  },
  { 
    rank: 8, 
    address: '0x9999...aaaa', 
    username: 'ClickMaster',
    score: 7850, 
    gamesPlayed: 192,
    winRate: 65,
    avgScore: 785,
    streak: 7,
    level: 25,
    change: -1,
    avatar: 'https://i.pravatar.cc/150?img=8'
  },
  { 
    rank: 9, 
    address: '0xbbbb...cccc', 
    username: 'ReactionPro',
    score: 7500, 
    gamesPlayed: 180,
    winRate: 63,
    avgScore: 750,
    streak: 2,
    level: 24,
    change: 1,
    avatar: 'https://i.pravatar.cc/150?img=9'
  },
  { 
    rank: 10, 
    address: '0xdddd...eeee', 
    username: 'GameChamp',
    score: 7200, 
    gamesPlayed: 168,
    winRate: 61,
    avgScore: 720,
    streak: 4,
    level: 22,
    change: -3,
    avatar: 'https://i.pravatar.cc/150?img=10'
  },
];

const topAchievers = [
  { title: 'Most Games Played', player: 'SpeedDemon', value: '342 games', icon: <Target className="w-5 h-5" /> },
  { title: 'Highest Win Rate', player: 'NinjaGamer', value: '87%', icon: <Award className="w-5 h-5" /> },
  { title: 'Longest Streak', player: 'SpeedDemon', value: '15 wins', icon: <FireIcon className="w-5 h-5" /> },
  { title: 'Fastest Rise', player: 'ArcadeKing', value: '+3 ranks', icon: <TrendingUp className="w-5 h-5" /> },
];

const Leaderboard = () => {
  const [selectedGame, setSelectedGame] = useState(games[0].value);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[3].value);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
          <Crown className="w-6 h-6 text-white" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full">
          <Medal className="w-6 h-6 text-white" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gray-700/50 rounded-full">
        <span className="text-white font-bold">#{rank}</span>
      </div>
    );
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-400 text-xs">
          <ArrowTrendingUpIcon className="w-4 h-4" />
          <span>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-400 text-xs">
          <ArrowTrendingUpIcon className="w-4 h-4 rotate-180" />
          <span>{change}</span>
        </div>
      );
    }
    return <div className="text-gray-500 text-xs">-</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 pt-20 pb-12">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 opacity-20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 opacity-20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <TrophyIcon className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Compete with the best players across all Lightning Arcade games
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {topAchievers.map((achiever, index) => (
            <motion.div
              key={achiever.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-blue-400">{achiever.icon}</div>
                <h3 className="text-sm font-semibold text-gray-400">{achiever.title}</h3>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{achiever.value}</div>
              <div className="text-sm text-gray-500">{achiever.player}</div>
            </motion.div>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center gap-2 mb-6">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm
                ${selectedTimeframe === timeframe.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'}
              `}
            >
              {timeframe.icon}
              {timeframe.label}
            </button>
          ))}
        </div>

        {/* Game Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {games.map((game) => (
            <button
              key={game.value}
              onClick={() => setSelectedGame(game.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 border text-sm
                ${selectedGame === game.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500 shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50 hover:text-white hover:border-gray-600'}
              `}
            >
              {game.icon}
              {game.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <div className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 backdrop-blur-sm border-2 border-gray-400/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={leaderboardData[1].avatar} 
                    alt={leaderboardData[1].username}
                    className="w-20 h-20 rounded-full border-4 border-gray-400"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gray-400 rounded-full p-2">
                    <Medal className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-300 mb-2">#2</div>
              <h3 className="text-xl font-bold text-white mb-1">{leaderboardData[1].username}</h3>
              <p className="text-sm text-gray-400 font-mono mb-4">{leaderboardData[1].address}</p>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                <div className="text-2xl font-bold text-white">{leaderboardData[1].score.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Score</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800/30 rounded p-2">
                  <div className="text-blue-400 font-bold">{leaderboardData[1].winRate}%</div>
                  <div className="text-gray-500">Win Rate</div>
                </div>
                <div className="bg-gray-800/30 rounded p-2">
                  <div className="text-green-400 font-bold">{leaderboardData[1].gamesPlayed}</div>
                  <div className="text-gray-500">Games</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-1 md:order-2"
          >
            <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-sm border-2 border-yellow-400/50 rounded-2xl p-6 text-center transform md:scale-110 md:-mt-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={leaderboardData[0].avatar} 
                    alt={leaderboardData[0].username}
                    className="w-24 h-24 rounded-full border-4 border-yellow-400"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2">
                    <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-5xl font-bold text-yellow-400 mb-2">#1</div>
              <h3 className="text-2xl font-bold text-white mb-1">{leaderboardData[0].username}</h3>
              <p className="text-sm text-gray-400 font-mono mb-4">{leaderboardData[0].address}</p>
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 mb-3">
                <div className="text-3xl font-bold text-white">{leaderboardData[0].score.toLocaleString()}</div>
                <div className="text-xs text-gray-300">Total Score</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800/30 rounded p-2">
                  <div className="text-blue-400 font-bold">{leaderboardData[0].winRate}%</div>
                  <div className="text-gray-500">Win Rate</div>
                </div>
                <div className="bg-gray-800/30 rounded p-2">
                  <div className="text-green-400 font-bold">{leaderboardData[0].gamesPlayed}</div>
                  <div className="text-gray-500">Games</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-3"
          >
            <div className="bg-gradient-to-br from-orange-400/20 to-orange-600/20 backdrop-blur-sm border-2 border-orange-400/50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={leaderboardData[2].avatar} 
                    alt={leaderboardData[2].username}
                    className="w-20 h-20 rounded-full border-4 border-orange-400"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-orange-400 rounded-full p-2">
                    <Medal className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="text-4xl font-bold text-orange-300 mb-2">#3</div>
              <h3 className="text-xl font-bold text-white mb-1">{leaderboardData[2].username}</h3>
              <p className="text-sm text-gray-400 font-mono mb-4">{leaderboardData[2].address}</p>
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                <div className="text-2xl font-bold text-white">{leaderboardData[2].score.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Score</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800/30 rounded p-2">
                  <div className="text-blue-400 font-bold">{leaderboardData[2].winRate}%</div>
                  <div className="text-gray-500">Win Rate</div>
                </div>
                <div className="bg-gray-800/30 rounded p-2">
                  <div className="text-green-400 font-bold">{leaderboardData[2].gamesPlayed}</div>
                  <div className="text-gray-500">Games</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Games</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Win Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Streak</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {leaderboardData.map((entry, index) => (
                  <motion.tr
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-500/5 transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getRankBadge(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={entry.avatar} 
                          alt={entry.username}
                          className="w-10 h-10 rounded-full border-2 border-gray-600"
                        />
                        <div>
                          <div className="font-semibold text-white">{entry.username}</div>
                          <div className="text-xs text-gray-500 font-mono">{entry.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-white">{entry.level}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-green-400">{entry.score.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Avg: {entry.avgScore}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-semibold">{entry.gamesPlayed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${entry.winRate}%` }}
                          ></div>
                        </div>
                        <span className="text-blue-400 font-semibold text-sm">{entry.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-bold">{entry.streak}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRankChangeIndicator(entry.change)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Leaderboard updates every 5 minutes • Last updated: Just now
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <BoltIcon className="w-4 h-4" />
            <span>Powered by Somnia's high-speed blockchain</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;