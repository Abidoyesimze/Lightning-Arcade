import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  UsersIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FireIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  EyeIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Game {
  id: number;
  name: string;
  type: 'speed-clicker' | 'memory-chain' | 'word-blitz' | 'reaction-time' | 'number-ninja' | 'pattern-samurai';
  icon: string;
  players: number;
  maxPlayers: number;
  entryFee: string;
  prizePool: string;
  timeLeft: string;
  status: 'waiting' | 'starting' | 'live';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  creator: string;
  gradient: string;
  description: string;
  duration: number;
  isAvailable: boolean;
}

const GameLobby = () => {
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'players' | 'prize' | 'time'>('players');

  // Available mini games
  const [games, setGames] = useState<Game[]>([
    {
      id: 1,
      name: "Lightning Clicker Championship",
      type: "speed-clicker",
      icon: "🖱️",
      players: 47,
      maxPlayers: 100,
      entryFee: "0.01",
      prizePool: "0.47",
      timeLeft: "2:34",
      status: 'waiting',
      difficulty: 'Easy',
      creator: '0x1234...5678',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Click as fast as you can in 10 seconds!',
      duration: 10,
      isAvailable: true
    },
    {
      id: 2,
      name: "Memory Master Arena",
      type: "memory-chain",
      icon: "🧠",
      players: 23,
      maxPlayers: 50,
      entryFee: "0.005",
      prizePool: "0.115",
      timeLeft: "1:12",
      status: 'starting',
      difficulty: 'Medium',
      creator: '0xabcd...efgh',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Memorize and repeat color sequences',
      duration: 300,
      isAvailable: true
    },
    {
      id: 3,
      name: "Word Blitz Showdown",
      type: "word-blitz",
      icon: "⌨️",
      players: 89,
      maxPlayers: 200,
      entryFee: "0.02",
      prizePool: "1.78",
      timeLeft: "0:45",
      status: 'live',
      difficulty: 'Hard',
      creator: '0x9876...5432',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Type words at lightning speed',
      duration: 60,
      isAvailable: true // Now available
    },
    {
      id: 4,
      name: "Reaction Royale",
      type: "reaction-time",
      icon: "⚡",
      players: 156,
      maxPlayers: 300,
      entryFee: "0.015",
      prizePool: "2.34",
      timeLeft: "4:21",
      status: 'waiting',
      difficulty: 'Medium',
      creator: '0xfeed...beef',
      gradient: 'from-yellow-500 to-orange-500',
      description: 'React to visual cues instantly',
      duration: 45,
      isAvailable: false // Coming soon
    },
    {
      id: 5,
      name: "Number Ninja Dojo",
      type: "number-ninja",
      icon: "🔢",
      players: 34,
      maxPlayers: 75,
      entryFee: "0.008",
      prizePool: "0.272",
      timeLeft: "6:15",
      status: 'waiting',
      difficulty: 'Hard',
      creator: '0xdead...cafe',
      gradient: 'from-red-500 to-pink-500',
      description: 'Solve math problems quickly',
      duration: 120,
      isAvailable: true // Now available
    },
    {
      id: 6,
      name: "Pattern Pro League",
      type: "pattern-samurai",
      icon: "🎨",
      players: 67,
      maxPlayers: 120,
      entryFee: "0.012",
      prizePool: "0.804",
      timeLeft: "3:08",
      status: 'waiting',
      difficulty: 'Medium',
      creator: '0xface...b00c',
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Copy visual patterns perfectly',
      duration: 90,
      isAvailable: false // Coming soon
    }
  ]);

  const gameTypes = [
    { value: 'all', label: 'All Games', count: games.length },
    { value: 'speed-clicker', label: 'Speed Clicker', count: games.filter(g => g.type === 'speed-clicker').length },
    { value: 'memory-chain', label: 'Memory Chain', count: games.filter(g => g.type === 'memory-chain').length },
    { value: 'word-blitz', label: 'Word Blitz', count: games.filter(g => g.type === 'word-blitz').length },
    { value: 'reaction-time', label: 'Reaction Time', count: games.filter(g => g.type === 'reaction-time').length },
    { value: 'number-ninja', label: 'Number Ninja', count: games.filter(g => g.type === 'number-ninja').length },
    { value: 'pattern-samurai', label: 'Pattern Samurai', count: games.filter(g => g.type === 'pattern-samurai').length },
  ];

  // Filter and sort games
  const filteredGames = games
    .filter(game => 
      (selectedGameType === 'all' || game.type === selectedGameType) &&
      (searchTerm === '' || game.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'players': return b.players - a.players;
        case 'prize': return parseFloat(b.prizePool) - parseFloat(a.prizePool);
        case 'time': return parseInt(a.timeLeft.split(':')[0]) - parseInt(b.timeLeft.split(':')[0]);
        default: return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'starting': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'live': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Hard': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGames(prevGames => 
        prevGames.map(game => ({
          ...game,
          players: Math.min(game.maxPlayers, game.players + Math.floor(Math.random() * 3)),
          prizePool: (parseFloat(game.prizePool) + Math.random() * 0.01).toFixed(3)
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-gray-950 via-purple-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-gaming text-white mb-4">
            Game <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Lobby</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of players in real-time mini games. Choose your arena and dominate!
          </p>
        </motion.div>

        {/* Available Now Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <BoltIcon className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Available Now</h2>
            <span className="text-green-400 text-sm font-medium ml-2">• Playable</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {games.filter(game => game.isAvailable).map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <div className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col justify-between min-h-[260px]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${game.gradient} rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {game.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{game.name}</h3>
                      <p className="text-sm text-gray-400">{game.description}</p>
                    </div>
                    <div className={`ml-auto px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(game.status)}`}>{game.status.toUpperCase()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-300">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{game.players}/{game.maxPlayers}</div>
                      <div className="text-xs">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{parseFloat(game.prizePool).toFixed(3)} ETH</div>
                      <div className="text-xs">Prize Pool</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{game.duration}s</div>
                      <div className="text-xs">Duration</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Players</span>
                      <span>{Math.round((game.players / game.maxPlayers) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(game.players / game.maxPlayers) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    {game.status === 'live' ? (
                      <Link to={`/game/${game.type}/${game.id}`} className="flex-1">
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                          <EyeIcon className="w-5 h-5" />
                          Spectate
                        </button>
                      </Link>
                    ) : (
                      <Link to={`/game/${game.type}/${game.id}`} className="flex-1">
                        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                          <PlayIcon className="w-5 h-5" />
                          Play Now
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coming Soon Games */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <FireIcon className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
            <span className="text-orange-400 text-sm font-medium ml-2">• In Development</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {games.filter(game => !game.isAvailable).map((game) => (
              <div key={game.id} className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-8 flex flex-col items-center justify-center opacity-60 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-300 min-h-[220px]">
                <div className={`w-14 h-14 bg-gradient-to-br ${game.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-md`}>
                  {game.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{game.name}</h3>
                <p className="text-sm text-gray-400 mb-4 text-center">{game.description}</p>
                <div className="px-3 py-1 rounded-lg text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/30">
                  COMING SOON
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats and CTA remain unchanged */}
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{games.filter(g => g.isAvailable).length}</div>
            <div className="text-sm text-gray-400">Available Games</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {games.filter(g => g.isAvailable).reduce((sum, game) => sum + game.players, 0)}
            </div>
            <div className="text-sm text-gray-400">Players Online</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {games.filter(g => g.isAvailable).reduce((sum, game) => sum + parseFloat(game.prizePool), 0).toFixed(2)} ETH
            </div>
            <div className="text-sm text-gray-400">Active Prizes</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {games.filter(g => g.status === 'live' && g.isAvailable).length}
            </div>
            <div className="text-sm text-gray-400">Live Games</div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h3>
            <p className="text-gray-300 mb-6">
              Join the action now! More games launching soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/game/speed-clicker/1">
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
                  🖱️ Try Speed Clicker
                </button>
              </Link>
              <Link to="/game/memory-chain/2">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
                  🧠 Try Memory Chain
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GameLobby;