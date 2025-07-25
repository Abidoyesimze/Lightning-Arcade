import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  FireIcon,
  BoltIcon 
} from '@heroicons/react/24/outline';

interface SpeedClickerGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameEnd?: (finalScore: number) => void;
  gameId?: string;
  duration?: number;
}

interface ScorePopup {
  id: number;
  value: number;
  x: number;
  y: number;
}

const SpeedClickerGame: React.FC<SpeedClickerGameProps> = ({
  onScoreUpdate,
  onGameEnd,
  gameId = "demo",
  duration = 10
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [countdownTime, setCountdownTime] = useState(3);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [buttonScale, setButtonScale] = useState(1);
  
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimesRef = useRef<number[]>([]);
  const popupIdRef = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate clicks per second
  const updateClicksPerSecond = useCallback(() => {
    const now = Date.now();
    clickTimesRef.current = clickTimesRef.current.filter(time => now - time < 1000);
    setClicksPerSecond(clickTimesRef.current.length);
  }, []);

  // Start countdown
  const startCountdown = useCallback(() => {
    setGameState('countdown');
    setCountdownTime(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          setGameState('playing');
          setTimeLeft(duration);
          
          // Start game timer
          gameIntervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
              if (prevTime <= 1) {
                setGameState('finished');
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    clickTimesRef.current.push(now);
    
    // Calculate new score with multiplier
    const basePoints = 1;
    const points = basePoints * multiplier;
    const newScore = score + points;
    setScore(newScore);
    
    // Update streak
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
    }
    
    // Update multiplier based on streak
    if (newStreak >= 50) {
      setMultiplier(5);
    } else if (newStreak >= 30) {
      setMultiplier(4);
    } else if (newStreak >= 20) {
      setMultiplier(3);
    } else if (newStreak >= 10) {
      setMultiplier(2);
    } else {
      setMultiplier(1);
    }

    // Create score popup
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const popup: ScorePopup = {
        id: popupIdRef.current++,
        value: points,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      setScorePopups(prev => [...prev, popup]);
      
      // Remove popup after animation
      setTimeout(() => {
        setScorePopups(prev => prev.filter(p => p.id !== popup.id));
      }, 600);
    }

    // Button animation
    setButtonScale(0.95);
    setTimeout(() => setButtonScale(1), 100);

    // Update clicks per second
    updateClicksPerSecond();
    
    // Notify parent component
    onScoreUpdate?.(newScore);
  }, [gameState, score, multiplier, currentStreak, bestStreak, onScoreUpdate, updateClicksPerSecond]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(duration);
    setCountdownTime(3);
    setCurrentStreak(0);
    setMultiplier(1);
    setClicksPerSecond(0);
    setScorePopups([]);
    clickTimesRef.current = [];
    
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }, [duration]);

  // Game end effect
  useEffect(() => {
    if (gameState === 'finished') {
      onGameEnd?.(score);
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
  }, [gameState, score, onGameEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Update clicks per second periodically
  useEffect(() => {
    const interval = setInterval(updateClicksPerSecond, 100);
    return () => clearInterval(interval);
  }, [updateClicksPerSecond]);

  const getMultiplierColor = (mult: number) => {
    switch (mult) {
      case 5: return 'text-purple-400';
      case 4: return 'text-pink-400';
      case 3: return 'text-yellow-400';
      case 2: return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getButtonGradient = () => {
    if (multiplier >= 5) return 'from-purple-600 to-pink-600';
    if (multiplier >= 4) return 'from-pink-600 to-red-600';
    if (multiplier >= 3) return 'from-yellow-600 to-orange-600';
    if (multiplier >= 2) return 'from-green-600 to-emerald-600';
    return 'from-blue-600 to-purple-600';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="w-full max-w-4xl mx-auto">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-gaming text-white mb-4">
            🖱️ <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Speed Clicker</span>
          </h1>
          <p className="text-xl text-gray-300">Click as fast as you can!</p>
        </motion.div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{score}</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">{timeLeft}s</div>
            <div className="text-sm text-gray-400">Time Left</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">{clicksPerSecond}</div>
            <div className="text-sm text-gray-400">Clicks/sec</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className={`text-2xl md:text-3xl font-bold mb-1 ${getMultiplierColor(multiplier)}`}>
              {multiplier}x
            </div>
            <div className="text-sm text-gray-400">Multiplier</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 md:p-12 text-center">
          <AnimatePresence mode="wait">
            {gameState === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Click?</h2>
                <p className="text-gray-300 mb-8">
                  You have <span className="font-bold text-blue-400">{duration} seconds</span> to click as many times as possible!
                  <br />
                  Build up streaks for <span className="font-bold text-yellow-400">multipliers</span>!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCountdown}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <PlayIcon className="w-6 h-6" />
                  Start Game
                </motion.button>
              </motion.div>
            )}

            {gameState === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="space-y-6"
              >
                <motion.div
                  key={countdownTime}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="text-8xl md:text-9xl font-bold text-white"
                >
                  {countdownTime}
                </motion.div>
                <p className="text-xl text-gray-300">Get ready...</p>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                {/* Click Button */}
                <div className="relative">
                  <motion.button
                    ref={buttonRef}
                    animate={{ scale: buttonScale }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={handleClick}
                    className={`relative w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br ${getButtonGradient()} hover:shadow-2xl rounded-full text-white font-bold text-2xl md:text-3xl transition-all duration-200 mx-auto flex items-center justify-center border-4 border-white/20 shadow-2xl`}
                    style={{
                      boxShadow: `0 0 ${multiplier * 10}px rgba(59, 130, 246, 0.5)`,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl mb-2">🖱️</div>
                      <div>CLICK!</div>
                      {multiplier > 1 && (
                        <div className={`text-sm ${getMultiplierColor(multiplier)}`}>
                          {multiplier}x COMBO!
                        </div>
                      )}
                    </div>
                  </motion.button>

                  {/* Score Popups */}
                  <AnimatePresence>
                    {scorePopups.map((popup) => (
                      <motion.div
                        key={popup.id}
                        initial={{ opacity: 1, scale: 1, x: popup.x, y: popup.y }}
                        animate={{ 
                          opacity: 0, 
                          scale: 1.5, 
                          x: popup.x + (Math.random() - 0.5) * 100,
                          y: popup.y - 80 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute pointer-events-none text-yellow-400 font-bold text-xl"
                        style={{ left: popup.x, top: popup.y }}
                      >
                        +{popup.value}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Streak Info */}
                {currentStreak >= 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-yellow-400"
                  >
                    <FireIcon className="w-6 h-6" />
                    <span className="font-bold text-xl">{currentStreak} Click Streak!</span>
                    <FireIcon className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Game Over!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{score}</div>
                    <div className="text-sm text-gray-300">Final Score</div>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{bestStreak}</div>
                    <div className="text-sm text-gray-300">Best Streak</div>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {(score / duration).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-300">Avg Clicks/sec</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <ArrowPathIcon className="w-6 h-6" />
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SpeedClickerGame;