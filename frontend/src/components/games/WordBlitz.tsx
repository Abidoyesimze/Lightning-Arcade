import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  ArrowPathIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface WordBlitzGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameEnd?: (finalScore: number) => void;
  gameId?: string;
  duration?: number;
}

interface WordChallenge {
  word: string;
  typed: string;
  isComplete: boolean;
  isCorrect: boolean;
  startTime: number;
}

const WordBlitzGame: React.FC<WordBlitzGameProps> = ({
  onScoreUpdate,
  onGameEnd,
  gameId = "demo",
  duration = 60
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [countdownTime, setCountdownTime] = useState(3);
  const [currentWord, setCurrentWord] = useState('');
  const [typedWord, setTypedWord] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wordHistory, setWordHistory] = useState<WordChallenge[]>([]);
  const [wordFeedback, setWordFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameStartTimeRef = useRef<number>(0);
  // Add a ref to track if the game is actually running
  const isGameActiveRef = useRef(false);
  
  // Add word timer state
  const [wordTimeLeft, setWordTimeLeft] = useState(5);

  // Word lists by category
  const wordCategories = {
    common: [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out',
      'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy',
      'did', 'man', 'end', 'few', 'got', 'lot', 'own', 'say', 'she', 'too', 'use', 'way', 'work', 'life', 'only'
    ],
    medium: [
      'about', 'after', 'again', 'before', 'being', 'below', 'could', 'doing', 'during', 'each', 'few', 'from',
      'further', 'having', 'here', 'itself', 'more', 'most', 'other', 'over', 'same', 'should', 'some', 'such',
      'than', 'that', 'their', 'them', 'these', 'they', 'this', 'those', 'through', 'under', 'until', 'very',
      'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'people', 'water', 'right', 'think'
    ],
    hard: [
      'beautiful', 'important', 'interesting', 'different', 'possible', 'necessary', 'available', 'particular',
      'education', 'government', 'development', 'management', 'environment', 'experience', 'technology', 'community',
      'opportunity', 'performance', 'responsibility', 'understanding', 'international', 'organization', 'information',
      'application', 'relationship', 'achievement', 'establishment', 'investigation', 'presentation', 'administration'
    ],
    tech: [
      'algorithm', 'blockchain', 'cryptocurrency', 'database', 'framework', 'javascript', 'programming', 'software',
      'hardware', 'network', 'security', 'protocol', 'interface', 'deployment', 'repository', 'container', 'server',
      'frontend', 'backend', 'fullstack', 'debugging', 'testing', 'optimization', 'integration', 'scalability'
    ]
  };

  // Get random word based on current difficulty
  const getRandomWord = useCallback(() => {
    const difficulty = wordsCompleted < 10 ? 'common' : 
                      wordsCompleted < 25 ? 'medium' : 
                      wordsCompleted < 40 ? 'hard' : 'tech';
    
    const words = wordCategories[difficulty];
    return words[Math.floor(Math.random() * words.length)];
  }, [wordsCompleted]);

  // Clear all intervals and timeouts safely
  const clearAllTimers = useCallback(() => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  // Start word timer (5 seconds per word)
  const startWordTimer = useCallback(() => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
    }
    
    setWordTimeLeft(5);
    
    wordTimerRef.current = setInterval(() => {
      setWordTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for this word, move to next
          if (isGameActiveRef.current) {
            const wordChallenge: WordChallenge = {
              word: currentWord,
              typed: typedWord,
              isComplete: true,
              isCorrect: false,
              startTime: Date.now()
            };
            
            setWordHistory(prev => [...prev, wordChallenge]);
            setWordsCompleted(prev => prev + 1);
            setStreak(0); // Break streak on timeout
            setCurrentWord(getRandomWord());
            setTypedWord('');
            
            // Update accuracy
            const acc = Math.round((wordsCorrect / Math.max(wordsCompleted + 1, 1)) * 100);
            setAccuracy(acc);
            
            // Start timer for next word
            startWordTimer();
          }
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentWord, typedWord, wordsCorrect, wordsCompleted, getRandomWord]);

  // Start countdown
  const startCountdown = useCallback(() => {
    // Clear any existing timers first
    clearAllTimers();
    
    setGameState('countdown');
    setCountdownTime(3);
    isGameActiveRef.current = true;
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          setGameState('playing');
          setTimeLeft(duration);
          gameStartTimeRef.current = Date.now();
          
          // Set first word
          setCurrentWord(getRandomWord());
          
          // Start word timer
          startWordTimer();
          
          // Focus input
          setTimeout(() => inputRef.current?.focus(), 100);
          
          // Start game timer
          gameIntervalRef.current = setInterval(() => {
            // Check if game is still active before updating
            if (!isGameActiveRef.current) {
              return;
            }
            
            setTimeLeft(prevTime => {
              if (prevTime <= 1) {
                // Double-check game is still active before finishing
                if (isGameActiveRef.current) {
                  setGameState('finished');
                }
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
          
          // Clear countdown interval
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, getRandomWord, clearAllTimers, startWordTimer]);

  // Handle typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing' || !isGameActiveRef.current) return;
    
    const value = e.target.value;
    setTypedWord(value);
    
    // Check if word is complete
    if (value === currentWord) {
      // Correct word completed
      const wordChallenge: WordChallenge = {
        word: currentWord,
        typed: value,
        isComplete: true,
        isCorrect: true,
        startTime: Date.now()
      };
      
      setWordHistory(prev => [...prev, wordChallenge]);
      setWordsCompleted(prev => prev + 1);
      setWordsCorrect(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
      
      // Calculate score (base points + length bonus + streak bonus)
      const basePoints = 10;
      const lengthBonus = currentWord.length * 2;
      const streakBonus = Math.min(streak * 5, 50);
      const points = basePoints + lengthBonus + streakBonus;
      
      const newScore = score + points;
      setScore(newScore);
      onScoreUpdate?.(newScore);
      
      // Feedback
      setWordFeedback('correct');
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        if (isGameActiveRef.current) {
          setWordFeedback(null);
          // Get next word and restart word timer
          setCurrentWord(getRandomWord());
          setTypedWord('');
          startWordTimer();
          // Calculate WPM and accuracy
          const timeElapsed = (Date.now() - gameStartTimeRef.current) / 1000 / 60; // minutes
          const wordsPerMinute = Math.round(wordsCorrect / Math.max(timeElapsed, 0.1));
          setWpm(wordsPerMinute);
          const acc = Math.round((wordsCorrect / Math.max(wordsCompleted, 1)) * 100);
          setAccuracy(acc);
        }
      }, 800); // Reduced time for faster gameplay
      return;
    } else if (value.length > currentWord.length || 
               (value.length > 0 && !currentWord.startsWith(value))) {
      // Word is wrong or too long
      const wordChallenge: WordChallenge = {
        word: currentWord,
        typed: value,
        isComplete: true,
        isCorrect: false,
        startTime: Date.now()
      };
      
      setWordHistory(prev => [...prev, wordChallenge]);
      setWordsCompleted(prev => prev + 1);
      setStreak(0);
      setWordFeedback('incorrect');
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        if (isGameActiveRef.current) {
          setWordFeedback(null);
          // Get next word and restart word timer
          setCurrentWord(getRandomWord());
          setTypedWord('');
          startWordTimer();
          // Update accuracy
          const acc = Math.round((wordsCorrect / Math.max(wordsCompleted, 1)) * 100);
          setAccuracy(acc);
        }
      }, 800); // Reduced time for faster gameplay
      return;
    }
  }, [gameState, currentWord, score, streak, maxStreak, wordsCorrect, wordsCompleted, getRandomWord, onScoreUpdate, startWordTimer]);

  // Handle key press for special keys
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Skip word (penalty)
      setWordsCompleted(prev => prev + 1);
      setStreak(0);
      setCurrentWord(getRandomWord());
      setTypedWord('');
      startWordTimer(); // Restart word timer for new word
    }
  }, [getRandomWord, startWordTimer]);

  // Reset game function - fixed to prevent race conditions
  const resetGame = useCallback(() => {
    // First, set the game as inactive to stop any running timers
    isGameActiveRef.current = false;
    
    // Clear all timers
    clearAllTimers();
    
    // Reset all state
    setGameState('waiting');
    setScore(0);
    setTimeLeft(duration);
    setCountdownTime(3);
    setCurrentWord('');
    setTypedWord('');
    setWordsCompleted(0);
    setWordsCorrect(0);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setMaxStreak(0);
    setWordHistory([]);
    setWordFeedback(null);
    setWordTimeLeft(5);
    gameStartTimeRef.current = 0;
    
    // Give a small delay to ensure all state updates are processed
    setTimeout(() => {
      console.log('Game reset complete');
    }, 100);
  }, [duration, clearAllTimers]);

  // Game end effect
  useEffect(() => {
    if (gameState === 'finished' && isGameActiveRef.current) {
      isGameActiveRef.current = false;
      clearAllTimers();
      onGameEnd?.(score);
    }
  }, [gameState, score, onGameEnd, clearAllTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isGameActiveRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Get character styling for visual feedback
  const getCharacterStyle = (char: string, index: number) => {
    if (index >= typedWord.length) {
      return 'text-gray-400'; // Not typed yet
    }
    
    const typedChar = typedWord[index];
    if (typedChar === char) {
      return 'text-green-400 bg-green-400/20'; // Correct
    } else {
      return 'text-red-400 bg-red-400/20'; // Incorrect
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 20) return 'text-purple-400';
    if (streak >= 15) return 'text-pink-400';
    if (streak >= 10) return 'text-yellow-400';
    if (streak >= 5) return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-green-900 to-teal-900">
      <div className="w-full max-w-4xl mx-auto">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-gaming text-white mb-4">
            ⌨️ <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Word Blitz</span>
          </h1>
          <p className="text-xl text-gray-300">Type the words as fast as you can!</p>
        </motion.div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">{score}</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{timeLeft}s</div>
            <div className="text-sm text-gray-400">Time</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">{wpm}</div>
            <div className="text-sm text-gray-400">WPM</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">{accuracy}%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
            <div className={`text-2xl md:text-3xl font-bold mb-1 ${getStreakColor(streak)}`}>{streak}</div>
            <div className="text-sm text-gray-400">Streak</div>
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
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Type?</h2>
                <p className="text-gray-300 mb-8">
                  Type the words as fast and accurately as possible!
                  <br />
                  Each word has a <span className="font-bold text-blue-400">5-second timer</span> - type fast!
                  <br />
                  Build up streaks for <span className="font-bold text-green-400">bonus points</span>!
                  <br />
                  <span className="text-sm text-gray-400">Press Tab to skip a word (breaks streak)</span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCountdown}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto mt-8"
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
                <p className="text-xl text-gray-300">Get your fingers ready...</p>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8"
              >
                {/* Current Word Display */}
                <div className="mb-8">
                  {/* Word Timer */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                      wordTimeLeft <= 2 ? 'bg-red-500/20 border border-red-500/40' : 'bg-blue-500/20 border border-blue-500/40'
                    }`}>
                      <ClockIcon className={`w-5 h-5 ${wordTimeLeft <= 2 ? 'text-red-400' : 'text-blue-400'}`} />
                      <span className={`font-bold text-lg ${wordTimeLeft <= 2 ? 'text-red-400' : 'text-blue-400'}`}>
                        {wordTimeLeft}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-4xl md:text-6xl font-mono font-bold mb-6 tracking-wider">
                    {currentWord.split('').map((char, index) => {
                      const isTyped = index < typedWord.length;
                      const typedChar = typedWord[index];
                      let style = 'text-gray-400';
                      if (isTyped) {
                        style = typedChar === char ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20';
                      }
                      return (
                        <span
                          key={index}
                          className={`${style} px-1 rounded transition-all duration-200`}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                  {/* Show user's input below the word for clarity */}
                  <div className="mt-2 text-xl font-mono tracking-wider">
                    <span className="text-gray-400">Your input: </span>
                    {typedWord.length === 0 ? (
                      <span className="text-gray-500 italic">(Start typing...)</span>
                    ) : (
                      typedWord.split('').map((char, idx) => {
                        const correct = currentWord[idx] === char;
                        return (
                          <span key={idx} className={correct ? 'text-green-400' : 'text-red-400'}>{char}</span>
                        );
                      })
                    )}
                  </div>
                  {/* Input Field */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedWord}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="w-full max-w-md mx-auto text-2xl text-center bg-gray-700/50 border-2 border-gray-600 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all duration-300 mt-4"
                    placeholder="Type the word above..."
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                {/* Progress Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{wordsCompleted}</div>
                    <div className="text-sm text-gray-400">Words</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{wordsCorrect}</div>
                    <div className="text-sm text-gray-400">Correct</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">{wpm}</div>
                    <div className="text-sm text-gray-400">WPM</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${getStreakColor(streak)}`}>{streak}</div>
                    <div className="text-sm text-gray-400">Streak</div>
                  </div>
                </div>

                {/* Streak indicator */}
                {streak >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-center gap-2 ${getStreakColor(streak)}`}
                  >
                    <span className="text-2xl">⌨️</span>
                    <span className="font-bold text-xl">{streak} Word Streak!</span>
                    <span className="text-2xl">⌨️</span>
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
                <div className="text-6xl mb-6">📝</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Time's Up!</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-400 mb-1">{score}</div>
                    <div className="text-sm text-gray-300">Final Score</div>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{wpm}</div>
                    <div className="text-sm text-gray-300">WPM</div>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{accuracy}%</div>
                    <div className="text-sm text-gray-300">Accuracy</div>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">{maxStreak}</div>
                    <div className="text-sm text-gray-300">Best Streak</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <ArrowPathIcon className="w-6 h-6" />
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          {gameState === 'playing' && wordFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none`}
            >
              {wordFeedback === 'correct' ? (
                <div className="flex flex-col items-center">
                  <span className="text-7xl md:text-8xl text-green-400">✅</span>
                  <span className="text-2xl text-green-300 font-bold mt-2">Correct!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-7xl md:text-8xl text-red-400">❌</span>
                  <span className="text-2xl text-red-300 font-bold mt-2">Try Next!</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordBlitzGame;