import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Import game components
import SpeedClickerGame from './SpeedClicker';
import MemoryChainGame from './MemoryChain';
import WordBlitzGame from './WordBlitz';
import NumberNinja from './NumberNinja';

// Coming soon placeholder
const ComingSoonGame: React.FC<{ gameType: string }> = ({ gameType }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="text-center">
      <div className="text-6xl mb-6">🚧</div>
      <h2 className="text-3xl font-bold text-white mb-4">Coming Soon!</h2>
      <p className="text-xl text-gray-300 mb-8">
        {gameType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} is currently in development
      </p>
      <Link to="/lobby">
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300">
          Back to Lobby
        </button>
      </Link>
    </div>
  </div>
);

interface GameData {
  id: number;
  name: string;
  type: string;
  players: number;
  maxPlayers: number;
  prizePool: string;
  status: string;
}

const Game = () => {
  const { gameType, gameId } = useParams<{ gameType: string; gameId: string }>();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mock game data - in real app this would come from blockchain
  useEffect(() => {
    const loadGameData = () => {
      setTimeout(() => {
        setGameData({
          id: parseInt(gameId || '1'),
          name: gameType === 'speed-clicker' ? 'Lightning Clicker Championship' : 'Memory Master Arena',
          type: gameType || '',
          players: 47,
          maxPlayers: 100,
          prizePool: "0.47",
          status: 'active'
        });
        setIsLoading(false);
      }, 1000);
    };

    loadGameData();
  }, [gameType, gameId]);

  const handleScoreUpdate = (score: number) => {
    setPlayerScore(score);
    // In real app, this would submit to blockchain
    console.log(`Score updated: ${score}`);
  };

  const handleGameEnd = (finalScore: number) => {
    setPlayerScore(finalScore);
    toast.success(`Game completed! Final score: ${finalScore}`, {
      duration: 5000,
    });
    
    // In real app, this would:
    // 1. Submit final score to blockchain
    // 2. Update leaderboards
    // 3. Distribute prizes if won
    console.log(`Game ended with score: ${finalScore}`);
  };

  const renderGame = () => {
    if (!gameType) return <ComingSoonGame gameType="unknown" />;

    switch (gameType) {
      case 'speed-clicker':
        return (
          <SpeedClickerGame
            onScoreUpdate={handleScoreUpdate}
            onGameEnd={handleGameEnd}
            gameId={gameId}
            duration={10}
          />
        );
      case 'memory-chain':
        return (
          <MemoryChainGame
            onScoreUpdate={handleScoreUpdate}
            onGameEnd={handleGameEnd}
            gameId={gameId}
          />
        );
      case 'word-blitz':
        return (
          <WordBlitzGame
            onScoreUpdate={handleScoreUpdate}
            onGameEnd={handleGameEnd}
            gameId={gameId}
          />
        );
      case 'number-ninja':
        return (
          <NumberNinja
            onScoreUpdate={handleScoreUpdate}
            onGameEnd={handleGameEnd}
            gameId={gameId}
          />
        );
      case 'reaction-time':
      case 'pattern-samurai':
        return <ComingSoonGame gameType={gameType} />;
      default:
        return <ComingSoonGame gameType={gameType} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <p className="text-gray-300 mt-4">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Game Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Link 
              to="/lobby" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Lobby</span>
            </Link>

            {/* Game Info */}
            {gameData && (
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {gameData.players}/{gameData.maxPlayers} players
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-green-400 font-medium">
                      {gameData.prizePool} ETH prize
                    </span>
                  </div>
                </div>

                {/* Player Score */}
                {playerScore > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1"
                  >
                    <span className="text-sm text-blue-400 font-medium">
                      Score: {playerScore}
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="relative">
        {renderGame()}
      </div>

      {/* Mobile Game Info */}
      {gameData && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 p-4 z-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{gameData.players}/{gameData.maxPlayers}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-4 h-4 text-gray-400" />
              <span className="text-green-400">{gameData.prizePool} ETH</span>
            </div>
            {playerScore > 0 && (
              <div className="text-blue-400 font-medium">
                Score: {playerScore}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;