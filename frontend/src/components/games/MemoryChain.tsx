import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  ArrowPathIcon,
  EyeIcon,
  HandRaisedIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MemoryChainGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameEnd?: (finalScore: number) => void;
  gameId?: string;
}

type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
type GamePhase = 'waiting' | 'instructions' | 'showing' | 'input' | 'feedback' | 'finished';

interface ColorButton {
  color: Color;
  isActive: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
}

const MemoryChainGame: React.FC<MemoryChainGameProps> = ({
  onScoreUpdate,
  onGameEnd,
  gameId = "demo"
}) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [sequence, setSequence] = useState<Color[]>([]);
  const [userInput, setUserInput] = useState<Color[]>([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [showingColor, setShowingColor] = useState<Color | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [perfect, setPerfect] = useState(true);
  
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  
  const colorStyles = {
    red: { bg: 'bg-red-500', border: 'border-red-400', shadow: 'shadow-red-500/50' },
    blue: { bg: 'bg-blue-500', border: 'border-blue-400', shadow: 'shadow-blue-500/50' },
    green: { bg: 'bg-green-500', border: 'border-green-400', shadow: 'shadow-green-500/50' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-400', shadow: 'shadow-purple-500/50' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-400', shadow: 'shadow-orange-500/50' }
  };

  // Generate new sequence
  const generateSequence = useCallback((length: number) => {
    const newSequence: Color[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    return newSequence;
  }, []);

  // Start new level
  const startLevel = useCallback(() => {
    const sequenceLength = Math.min(3 + level - 1, 15); // Start with 3, max 15
    const newSequence = generateSequence(sequenceLength);
    setSequence(newSequence);
    setUserInput([]);
    setCurrentSequenceIndex(0);
    setGamePhase('instructions');
    
    // Show instructions briefly
    setTimeout(() => {
      setGamePhase('showing');
      showSequence(newSequence);
    }, 2000);
  }, [level, generateSequence]);

  // Show sequence to player
  const showSequence = useCallback((seq: Color[]) => {
    let index = 0;
    const showNext = () => {
      if (index >= seq.length) {
        setShowingColor(null);
        setGamePhase('input');
        setTimeLeft(Math.max(10, 20 - level)); // Decreasing time as level increases
        
        // Start input timer
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleTimeout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      setShowingColor(seq[index]);
      setCurrentSequenceIndex(index);
      
      sequenceTimeoutRef.current = setTimeout(() => {
        setShowingColor(null);
        setTimeout(() => {
          index++;
          showNext();
        }, 300);
      }, 800);
    };
    
    showNext();
  }, [level]);

  // Handle color button click
  const handleColorClick = useCallback((color: Color) => {
    if (gamePhase !== 'input') return;

    const newUserInput = [...userInput, color];
    setUserInput(newUserInput);

    // Check if this input is correct
    const isCorrect = sequence[newUserInput.length - 1] === color;
    
    if (!isCorrect) {
      // Wrong input
      setPerfect(false);
      setGamePhase('feedback');
      setLives(prev => prev - 1);
      
      if (lives <= 1) {
        // Game over
        setGamePhase('finished');
        onGameEnd?.(score);
      } else {
        // Show feedback and retry
        setTimeout(() => {
          startLevel();
        }, 2000);
      }
      return;
    }

    // Correct input
    if (newUserInput.length === sequence.length) {
      // Completed sequence successfully
      const points = sequence.length * 10 + (perfect ? 50 : 0); // Bonus for perfect
      const newScore = score + points;
      setScore(newScore);
      setLevel(prev => prev + 1);
      setPerfect(true);
      onScoreUpdate?.(newScore);
      
      setGamePhase('feedback');
      setTimeout(() => {
        startLevel();
      }, 2000);
    }
  }, [gamePhase, userInput, sequence, lives, score, perfect, onScoreUpdate, onGameEnd]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    setGamePhase('feedback');
    setLives(prev => prev - 1);
    setPerfect(false);
    
    if (lives <= 1) {
      setGamePhase('finished');
      onGameEnd?.(score);
    } else {
      setTimeout(() => {
        startLevel();
      }, 2000);
    }
  }, [lives, score, onGameEnd]);

  // Start game
  const startGame = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setPerfect(true);
    startLevel();
  }, [startLevel]);

  // Reset game
  const resetGame = useCallback(() => {
    setGamePhase('waiting');
    setSequence([]);
    setUserInput([]);
    setCurrentSequenceIndex(0);
    setScore(0);
    setLevel(1);
    setLives(3);
    setShowingColor(null);
    setTimeLeft(0);
    setPerfect(true);
    
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
      if (inputTimeoutRef.current) clearTimeout(inputTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const renderColorButton = (color: Color, index: number) => {
    const style = colorStyles[color];
    const isShowing = showingColor === color;
    const isInUserInput = userInput.includes(color);
    const userClickedIndex = userInput.lastIndexOf(color);
    const isLastClicked = userClickedIndex === userInput.length - 1;
    const isCorrectInSequence = userClickedIndex >= 0 && sequence[userClickedIndex] === color;
    
    return (
      <motion.button
        key={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isShowing ? 1.2 : 1,
          opacity: 1,
          boxShadow: isShowing ? `0 0 30px ${style.shadow}` : 'none'
        }}
        whileHover={{ scale: gamePhase === 'input' ? 1.05 : 1 }}
        whileTap={{ scale: gamePhase === 'input' ? 0.95 : 1 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => handleColorClick(color)}
        disabled={gamePhase !== 'input'}
        className={`
          w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 transition-all duration-300
          ${style.bg} ${style.border}
          ${isShowing ? 'brightness-150 ' + style.shadow : ''}
          ${gamePhase === 'input' ? 'hover:brightness-110 cursor-pointer' : 'cursor-not-allowed'}
          ${isInUserInput && isLastClicked && gamePhase === 'feedback' 
            ? (isCorrectInSequence ? 'ring-4 ring-green-400' : 'ring-4 ring-red-400') 
            : ''
          }
          disabled:opacity-50
        `}
      />
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="w-full max-w-4xl mx-auto">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-gaming text-white mb-4">
            🧠 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Memory Chain</span>
          </h1>
          <p className="text-xl text-gray-300">Remember and repeat the sequence!</p>
        </motion.div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">{score}</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{level}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-red-400 mb-1">{lives}</div>
            <div className="text-sm text-gray-400">Lives</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">{timeLeft}</div>
            <div className="text-sm text-gray-400">Time</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 md:p-12 text-center">
          <AnimatePresence mode="wait">
            {gamePhase === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-6xl mb-6">🎯</div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Memory Challenge</h2>
                <p className="text-gray-300 mb-8">
                  Watch the sequence of colors, then repeat it back in the same order.
                  <br />
                  Each level adds more colors to remember!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <PlayIcon className="w-6 h-6" />
                  Start Game
                </motion.button>
              </motion.div>
            )}

            {gamePhase === 'instructions' && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-4xl mb-4">📖</div>
                <h2 className="text-2xl font-bold text-white mb-4">Level {level}</h2>
                <p className="text-lg text-gray-300">
                  Watch the sequence of <span className="font-bold text-purple-400">{sequence.length} colors</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <EyeIcon className="w-6 h-6" />
                  <span>Get ready to watch...</span>
                </div>
              </motion.div>
            )}

            {gamePhase === 'showing' && (
              <motion.div
                key="showing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-center gap-2 text-blue-400 mb-6">
                  <EyeIcon className="w-6 h-6" />
                  <span className="text-lg">Showing sequence: {currentSequenceIndex + 1}/{sequence.length}</span>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 justify-center max-w-2xl mx-auto">
                  {colors.map((color, index) => renderColorButton(color, index))}
                </div>

                <p className="text-gray-400">Watch carefully and remember the order!</p>
              </motion.div>
            )}

            {gamePhase === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                  <HandRaisedIcon className="w-6 h-6" />
                  <span className="text-lg">Your turn! Click the colors in order</span>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-400 mb-2">Progress: {userInput.length}/{sequence.length}</div>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {sequence.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index < userInput.length ? 'bg-green-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {timeLeft <= 5 && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="text-red-400 font-bold"
                    >
                      Hurry! {timeLeft} seconds left!
                    </motion.div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 justify-center max-w-2xl mx-auto">
                  {colors.map((color, index) => renderColorButton(color, index))}
                </div>
              </motion.div>
            )}

            {gamePhase === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                {userInput.length === sequence.length ? (
                  <div className="space-y-4">
                    <CheckIcon className="w-16 h-16 text-green-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-green-400">Perfect!</h2>
                    <p className="text-gray-300">
                      Level {level - 1} completed! 
                      {perfect && <span className="text-yellow-400 font-bold"> PERFECT BONUS!</span>}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <XMarkIcon className="w-16 h-16 text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-red-400">Incorrect!</h2>
                    <p className="text-gray-300">
                      Lives remaining: {lives}
                      {lives > 0 ? " - Try again!" : " - Game Over!"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {gamePhase === 'finished' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-6xl mb-6">🧠</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Game Over!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{score}</div>
                    <div className="text-sm text-gray-300">Final Score</div>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{level - 1}</div>
                    <div className="text-sm text-gray-300">Levels Completed</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
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

export default MemoryChainGame;