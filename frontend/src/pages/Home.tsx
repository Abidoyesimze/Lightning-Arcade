import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlayIcon, 
  BoltIcon, 
  TrophyIcon, 
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const gameTypes = [
    {
      id: 1,
      name: "Speed Clicker",
      icon: "🖱️",
      description: "Click as fast as you can in 10 seconds",
      players: "1,247",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "Memory Chain",
      icon: "🧠",
      description: "Memorize and repeat sequences",
      players: "892",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      name: "Word Blitz",
      icon: "⌨️",
      description: "Type words at lightning speed",
      players: "1,156",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      name: "Reaction Time",
      icon: "⚡",
      description: "React to visual cues instantly",
      players: "2,034",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      id: 5,
      name: "Number Ninja",
      icon: "🔢",
      description: "Solve math problems quickly",
      players: "743",
      gradient: "from-red-500 to-pink-500"
    },
    {
      id: 6,
      name: "Pattern Samurai",
      icon: "🎨",
      description: "Copy visual patterns perfectly",
      players: "658",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { label: "Active Players", value: "12,847", icon: UserGroupIcon },
    { label: "Games Played", value: "2.1M", icon: PlayIcon },
    { label: "Prizes Won", value: "$45.2K", icon: TrophyIcon },
    { label: "Avg Speed", value: "0.3s", icon: BoltIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 opacity-40 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 opacity-40 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 opacity-40 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-400 opacity-30 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold font-gaming">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Lightning
                </span>
                <br />
                <span className="text-white">Arcade</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The world's first <span className="text-blue-400 font-semibold">real-time multiplayer</span> mini games platform on blockchain. 
                Compete with <span className="text-purple-400 font-semibold">1000+ players</span> simultaneously and win instant prizes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <Link to="/lobby">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-3"
                  >
                    <PlayIcon className="w-6 h-6" />
                    Start Playing
                  </motion.button>
                </Link>
                
                <Link to="/tournaments">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 text-white font-semibold py-4 px-8 rounded-xl text-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-3"
                  >
                    <TrophyIcon className="w-6 h-6" />
                    Tournaments
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Game</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Six unique mini games, each designed for lightning-fast competition
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameTypes.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${game.gradient} rounded-2xl mb-6 text-4xl group-hover:scale-110 transition-transform duration-300`}>
                      {game.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">{game.name}</h3>
                    <p className="text-gray-400 mb-6">{game.description}</p>
                    
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-sm text-gray-500">
                        <UserGroupIcon className="w-4 h-4 inline mr-1" />
                        {game.players} playing
                      </div>
                      <div className="flex items-center text-green-400 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        Live
                      </div>
                    </div>
                    
                    <Link to={`/lobby?game=${game.id}`}>
                      <motion.button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 group-hover:shadow-lg">
                        Play Now
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Lightning Arcade</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                <BoltIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-300">
                Sub-second response times powered by Somnia's high-speed blockchain. No lag, no delays.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-6">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Massive Multiplayer</h3>
              <p className="text-gray-300">
                Compete with 1000+ players simultaneously in real-time. The ultimate test of skill.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Rewards</h3>
              <p className="text-gray-300">
                Win real prizes instantly. Every game, every tournament, every achievement matters.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-12"
          >
            <RocketLaunchIcon className="w-16 h-16 text-blue-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Dominate?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of players in the most competitive mini games arena on blockchain
            </p>
            <Link to="/lobby">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                Enter the Arena
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;