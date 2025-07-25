import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  ArrowPathIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  TrophyIcon,
  EyeIcon,
  UserGroupIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { TrophyIcon as TrophySolidIcon } from '@heroicons/react/24/solid';

interface NumberDojoGameProps {
  onScoreUpdate?: (score: number) => void;
  onGameEnd?: (finalScore: number, rank: number) => void;
  gameId?: string;
  playerName?: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  problemsCorrect: number;
  streak: number;
  isActive: boolean;
  rank: number;
  avatar: string;
}

interface MathProblem {
  equation: string;
  answer: number;
  userAnswer: string;
  isCorrect: boolean;
  timeToSolve: number;
}

interface Tournament {
  id: string;
  name: string;
  status: 'waiting' | 'starting' | 'active' | 'finished';
  duration: number;
  timeLeft: number;
  players: Player[];
  maxPlayers: number;
  prizePool: string[];
  difficulty: number;
}

const NumberDojoNinja: React.FC<NumberDojoGameProps> = ({
  onScoreUpdate,
  onGameEnd,
  gameId = "math-tournament",
  playerName = "Player"
}) => {
  const [gameState, setGameState] = useState<'lobby' | 'countdown' | 'playing' | 'finished'>('lobby');
  const [playerMode, setPlayerMode] = useState<'participating' | 'spectating'>('participating');
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    id: 'player-1',
    name: playerName,
    score: 0,
    problemsCorrect: 0,
    streak: 0,
    isActive: true,
    rank: 1,
    avatar: '🥷'
  });
  
  const [tournament, setTournament] = useState<Tournament>({
    id: 'tournament-1',
    name: 'Math Battle Arena',
    status: 'waiting',
    duration: 120, // 2 minutes
    timeLeft: 120,
    maxPlayers: 12,
    prizePool: ['🏆 Winner Badge', '🥇 Gold Medal', '💎 Premium Access'],
    difficulty: 1,
    players: [
      { id: 'player-1', name: playerName, score: 0, problemsCorrect: 0, streak: 0, isActive: true, rank: 1, avatar: '🥷' },
      { id: 'player-2', name: 'MathWizard', score: 0, problemsCorrect: 0, streak: 0, isActive: true, rank: 1, avatar: '🧙‍♂️' },
      { id: 'player-3', name: 'NumberNinja', score: 0, problemsCorrect: 0, streak: 0, isActive: true, rank: 1, avatar: '🐱‍👤' },
      { id: 'player-4', name: 'Calculator', score: 0, problemsCorrect: 0, streak: 0, isActive: true, rank: 1, avatar: '🤖' },
      { id: 'player-5', name: 'QuickSum', score: 0, problemsCorrect: 0, streak: 0, isActive: true, rank: 1, avatar: '⚡' },
      { id: 'player-6', name: 'BrainPower', score: 0, problemsCorrect: 0, streak: 0, isActive: true, rank: 1, avatar: '🧠' }
    ]
  });
  
  const [currentProblem, setCurrentProblem] = useState({ equation: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [problemsCorrect, setProblemsCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [problemFeedback, setProblemFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [ninjaState, setNinjaState] = useState<'idle' | 'celebrating' | 'disappointed' | 'focused' | 'panic'>('idle');
  const [problemTimeLeft, setProblemTimeLeft] = useState(6);
  const [countdownTime, setCountdownTime] = useState(5);
  
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const problemTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameStartTimeRef = useRef<number>(0);
  const isGameActiveRef = useRef(false);
  const problemStartTimeRef = useRef<number>(0);
  const botUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate math problems based on tournament difficulty
  const generateProblem = useCallback(() => {
    const level = tournament.difficulty;
    let num1: number, num2: number, operation: string, answer: number, equation: string;
    
    switch (level) {
      case 1: // Basic addition/subtraction
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
        answer = operation === '+' ? num1 + num2 : num1 - num2;
        equation = `${num1} ${operation} ${num2}`;
        break;
        
      case 2: // Multiplication and larger numbers
        if (Math.random() > 0.4) {
          num1 = Math.floor(Math.random() * 12) + 2;
          num2 = Math.floor(Math.random() * 12) + 2;
          answer = num1 * num2;
          equation = `${num1} × ${num2}`;
        } else {
          num1 = Math.floor(Math.random() * 50) + 10;
          num2 = Math.floor(Math.random() * 30) + 5;
          operation = Math.random() > 0.5 ? '+' : '-';
          if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
          answer = operation === '+' ? num1 + num2 : num1 - num2;
          equation = `${num1} ${operation} ${num2}`;
        }
        break;
        
      default: // Advanced mixed operations
        const ops = ['+', '-', '×'];
        operation = ops[Math.floor(Math.random() * ops.length)];
        if (operation === '×') {
          num1 = Math.floor(Math.random() * 15) + 3;
          num2 = Math.floor(Math.random() * 15) + 3;
          answer = num1 * num2;
        } else {
          num1 = Math.floor(Math.random() * 100) + 20;
          num2 = Math.floor(Math.random() * 50) + 10;
          if (operation === '-' && num2 > num1) [num1, num2] = [num2, num1];
          answer = operation === '+' ? num1 + num2 : num1 - num2;
        }
        equation = `${num1} ${operation} ${num2}`;
        break;
    }
    
    return { equation, answer };
  }, [tournament.difficulty]);

  // Simulate bot players for demo
  const updateBotScores = useCallback(() => {
    if (gameState === 'playing') {
      setTournament(prev => ({
        ...prev,
        players: prev.players.map(player => {
          if (player.id === 'player-1') return player; // Don't update current player
          
          // Random chance for bots to score
          if (Math.random() > 0.7) {
            const points = Math.floor(Math.random() * 50) + 20;
            return {
              ...player,
              score: player.score + points,
              problemsCorrect: player.problemsCorrect + 1,
              streak: Math.random() > 0.3 ? player.streak + 1 : 0
            };
          }
          return player;
        })
      }));
    }
  }, [gameState]);

  // Update leaderboard rankings
  const updateRankings = useCallback(() => {
    setTournament(prev => {
      const sortedPlayers = [...prev.players].sort((a, b) => b.score - a.score);
      return {
        ...prev,
        players: sortedPlayers.map((player, index) => ({
          ...player,
          rank: index + 1
        }))
      };
    });
  }, []);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (problemTimerRef.current) {
      clearInterval(problemTimerRef.current);
      problemTimerRef.current = null;
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (botUpdateIntervalRef.current) {
      clearInterval(botUpdateIntervalRef.current);
      botUpdateIntervalRef.current = null;
    }
  }, []);

  // Start problem timer
  const startProblemTimer = useCallback(() => {
    if (problemTimerRef.current) {
      clearInterval(problemTimerRef.current);
    }
    
    setProblemTimeLeft(6); // 6 seconds per problem
    setNinjaState('focused');
    problemStartTimeRef.current = Date.now();
    
    problemTimerRef.current = setInterval(() => {
      setProblemTimeLeft(prev => {
        if (prev <= 2) {
          setNinjaState('panic');
        }
        
        if (prev <= 1) {
          if (isGameActiveRef.current) {
            setProblemsCompleted(p => p + 1);
            setStreak(0);
            setNinjaState('disappointed');
            
            const newProblem = generateProblem();
            setCurrentProblem(newProblem);
            setUserAnswer('');
            
            setTimeout(() => startProblemTimer(), 800);
          }
          return 6;
        }
        return prev - 1;
      });
    }, 1000);
  }, [generateProblem]);

  // Join tournament
  const joinTournament = useCallback(() => {
    setGameState('countdown');
    setCountdownTime(5);
    isGameActiveRef.current = true;
    setNinjaState('focused');
    
    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          setGameState('playing');
          setTournament(t => ({ ...t, status: 'active', timeLeft: t.duration }));
          gameStartTimeRef.current = Date.now();
          
          const problem = generateProblem();
          setCurrentProblem(problem);
          startProblemTimer();
          
          setTimeout(() => inputRef.current?.focus(), 100);
          
          // Start tournament timer
          gameIntervalRef.current = setInterval(() => {
            if (!isGameActiveRef.current) return;
            
            setTournament(prev => {
              const newTimeLeft = prev.timeLeft - 1;
              if (newTimeLeft <= 0) {
                setGameState('finished');
                setNinjaState('idle');
                return { ...prev, timeLeft: 0, status: 'finished' };
              }
              return { ...prev, timeLeft: newTimeLeft };
            });
          }, 1000);
          
          // Start bot updates
          botUpdateIntervalRef.current = setInterval(updateBotScores, 2000);
          
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [generateProblem, startProblemTimer, updateBotScores]);

  // Handle answer submission
  const handleAnswerSubmit = useCallback(() => {
    if (gameState !== 'playing' || !isGameActiveRef.current || !userAnswer.trim()) return;
    
    const userNum = parseInt(userAnswer.trim());
    const isCorrect = userNum === currentProblem.answer;
    
    setProblemsCompleted(prev => prev + 1);
    
    if (isCorrect) {
      setProblemsCorrect(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
      
      // Scoring system with competitive bonuses
      const basePoints = 25;
      const speedBonus = Math.max(0, (problemTimeLeft - 1) * 10);
      const streakBonus = Math.min(streak * 15, 100);
      const difficultyBonus = tournament.difficulty * 10;
      const points = basePoints + speedBonus + streakBonus + difficultyBonus;
      
      const newScore = currentPlayer.score + points;
      
      // Update current player
      setCurrentPlayer(prev => ({
        ...prev,
        score: newScore,
        problemsCorrect: prev.problemsCorrect + 1,
        streak: streak + 1
      }));
      
      // Update in tournament
      setTournament(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === 'player-1' 
            ? { ...p, score: newScore, problemsCorrect: p.problemsCorrect + 1, streak: streak + 1 }
            : p
        )
      }));
      
      onScoreUpdate?.(newScore);
      
      setProblemFeedback('correct');
      setNinjaState('celebrating');
    } else {
      setStreak(0);
      setCurrentPlayer(prev => ({ ...prev, streak: 0 }));
      setTournament(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === 'player-1' ? { ...p, streak: 0 } : p
        )
      }));
      setProblemFeedback('incorrect');
      setNinjaState('disappointed');
    }
    
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      if (isGameActiveRef.current) {
        setProblemFeedback(null);
        const newProblem = generateProblem();
        setCurrentProblem(newProblem);
        setUserAnswer('');
        startProblemTimer();
      }
    }, 800);
  }, [gameState, userAnswer, currentProblem, problemTimeLeft, streak, currentPlayer.score, tournament.difficulty, onScoreUpdate, generateProblem, startProblemTimer]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing' || !isGameActiveRef.current) return;
    
    const value = e.target.value.replace(/[^-0-9]/g, '');
    setUserAnswer(value);
  }, [gameState]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnswerSubmit();
    }
  }, [handleAnswerSubmit]);

  // Switch to spectator mode
  const switchToSpectator = useCallback(() => {
    setPlayerMode('spectating');
    setNinjaState('idle');
  }, []);

  // Reset to lobby
  const backToLobby = useCallback(() => {
    isGameActiveRef.current = false;
    clearAllTimers();
    
    setGameState('lobby');
    setPlayerMode('participating');
    setCurrentPlayer(prev => ({ ...prev, score: 0, problemsCorrect: 0, streak: 0 }));
    setProblemsCompleted(0);
    setProblemsCorrect(0);
    setStreak(0);
    setMaxStreak(0);
    setProblemFeedback(null);
    setProblemTimeLeft(6);
    setNinjaState('idle');
    gameStartTimeRef.current = 0;
    
    // Reset tournament
    setTournament(prev => ({
      ...prev,
      status: 'waiting',
      timeLeft: prev.duration,
      players: prev.players.map(p => ({
        ...p,
        score: 0,
        problemsCorrect: 0,
        streak: 0,
        rank: 1
      }))
    }));
  }, [clearAllTimers]);

  // Update rankings periodically
  useEffect(() => {
    const interval = setInterval(updateRankings, 1000);
    return () => clearInterval(interval);
  }, [updateRankings]);

  // Game end effect
  useEffect(() => {
    if (gameState === 'finished' && isGameActiveRef.current) {
      isGameActiveRef.current = false;
      clearAllTimers();
      const finalRank = tournament.players.find(p => p.id === 'player-1')?.rank || 1;
      onGameEnd?.(currentPlayer.score, finalRank);
    }
  }, [gameState, currentPlayer.score, tournament.players, onGameEnd, clearAllTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isGameActiveRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Ninja animation component
  const NinjaCharacter = () => {
    const baseClass = "text-4xl md:text-6xl transition-all duration-500";
    
    switch (ninjaState) {
      case 'celebrating':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.6 }}
            className={baseClass}
          >
            🥷✨
          </motion.div>
        );
      case 'disappointed':
        return (
          <motion.div
            animate={{ 
              scale: [1, 0.9, 1],
              y: [0, 5, 0]
            }}
            transition={{ duration: 0.8 }}
            className={baseClass}
          >
            🥷💭
          </motion.div>
        );
      case 'panic':
        return (
          <motion.div
            animate={{ 
              x: [-2, 2, -2, 2, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
            className={baseClass}
          >
            🥷⚡
          </motion.div>
        );
      case 'focused':
        return (
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={baseClass}
          >
            🥷🎯
          </motion.div>
        );
      default:
        return <div className={baseClass}>🥷</div>;
    }
  };

  const currentRank = tournament.players.find(p => p.id === 'player-1')?.rank || 1;
  const accuracy = problemsCompleted > 0 ? Math.round((problemsCorrect / problemsCompleted) * 100) : 100;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 gap-6 pt-32 pb-8 px-2 md:px-8 justify-center items-center">
      {/* Main Game Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto lg:mx-0 flex flex-col justify-center items-center">
        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            🏆 <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Math Battle Arena</span>
          </h1>
          <p className="text-lg text-gray-300">Compete for the top spot!</p>
          
          {/* Tournament Status */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${
              tournament.status === 'waiting' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' :
              tournament.status === 'active' ? 'bg-green-500/20 border-green-500/40 text-green-300' :
              'bg-gray-500/20 border-gray-500/40 text-gray-300'
            }`}>
              {tournament.status === 'waiting' && '⏳ Waiting to Start'}
              {tournament.status === 'active' && `🔥 Live - ${Math.floor(tournament.timeLeft / 60)}:${(tournament.timeLeft % 60).toString().padStart(2, '0')}`}
              {tournament.status === 'finished' && '🏁 Tournament Ended'}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-lg">
              <UserGroupIcon className="w-4 h-4 text-purple-300" />
              <span className="text-purple-300 font-bold">{tournament.players.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Game Area */}
        <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 md:p-10 text-center w-full flex flex-col items-center justify-center min-h-[420px]">
          <AnimatePresence mode="wait">
            {gameState === 'lobby' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <NinjaCharacter />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Battle!</h2>
                
                {/* Prize Pool */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <h3 className="text-yellow-400 font-bold mb-2 flex items-center justify-center gap-2">
                    <GiftIcon className="w-5 h-5" />
                    Prize Pool
                  </h3>
                  <div className="space-y-1">
                    {tournament.prizePool.map((prize, index) => (
                      <div key={index} className="text-yellow-300">
                        {index + 1}. {prize}
                      </div>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-300 mb-8">
                  Compete against {tournament.maxPlayers} players!
                  <br />
                  Duration: <span className="font-bold text-blue-400">{tournament.duration}s</span>
                  <br />
                  <span className="text-sm text-gray-400">Solve math problems faster than everyone else!</span>
                </p>
                
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={joinTournament}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3"
                  >
                    <PlayIcon className="w-6 h-6" />
                    Join Tournament
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={switchToSpectator}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3"
                  >
                    <EyeIcon className="w-6 h-6" />
                    Spectate
                  </motion.button>
                </div>
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
                <NinjaCharacter />
                <motion.div
                  key={countdownTime}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="text-6xl md:text-8xl font-bold text-white"
                >
                  {countdownTime}
                </motion.div>
                <p className="text-xl text-gray-300">Get ready to compete!</p>
              </motion.div>
            )}

            {gameState === 'playing' && playerMode === 'participating' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                {/* Player Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3">
                    <div className="text-xl font-bold text-yellow-400">#{currentRank}</div>
                    <div className="text-sm text-gray-400">Rank</div>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3">
                    <div className="text-xl font-bold text-green-400">{currentPlayer.score}</div>
                    <div className="text-sm text-gray-400">Score</div>
                  </div>
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-3">
                    <div className="text-xl font-bold text-orange-400">{streak}</div>
                    <div className="text-sm text-gray-400">Streak</div>
                  </div>
                </div>

                {/* Ninja Character */}
                <div className="mb-4">
                  <NinjaCharacter />
                </div>

                {/* Problem Timer */}
                <div className="mb-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                    problemTimeLeft <= 2 ? 'bg-red-500/20 border border-red-500/40' : 'bg-blue-500/20 border border-blue-500/40'
                  }`}>
                    <ClockIcon className={`w-5 h-5 ${problemTimeLeft <= 2 ? 'text-red-400' : 'text-blue-400'}`} />
                    <span className={`font-bold text-lg ${problemTimeLeft <= 2 ? 'text-red-400' : 'text-blue-400'}`}>
                      {problemTimeLeft}s
                    </span>
                  </div>
                </div>

                {/* Math Problem */}
                <div className="mb-6">
                  <div className="text-4xl md:text-6xl font-bold mb-4 text-white font-mono">
                    {currentProblem.equation} = ?
                  </div>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={userAnswer}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="w-full max-w-sm mx-auto text-2xl text-center bg-gray-700/50 border-2 border-gray-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-all duration-300 mt-4"
                    placeholder="Answer..."
                    autoComplete="off"
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnswerSubmit}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-xl text-lg shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto mt-4"
                  >
                    <BoltIcon className="w-5 h-5" />
                    Submit
                  </motion.button>
                </div>

                {/* Streak indicator */}
                {streak >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-orange-400"
                  >
                    <FireIcon className="w-6 h-6" />
                    <span className="font-bold text-xl">{streak} Streak!</span>
                    <FireIcon className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {gameState === 'playing' && playerMode === 'spectating' && (
              <motion.div
                key="spectating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-4xl mb-4">👁️</div>
                <h2 className="text-2xl font-bold text-white">Spectating Tournament</h2>
                <p className="text-gray-300">
                  Watching the math battle unfold!
                  <br />
                  <span className="text-sm text-gray-400">Switch to participant mode to join the action</span>
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlayerMode('participating')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300"
                >
                  Join Battle
                </motion.button>
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
                <div className="text-6xl mb-4">
                  {currentRank === 1 ? '🏆' : currentRank === 2 ? '🥈' : currentRank === 3 ? '🥉' : '🎯'}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Tournament Complete!</h2>
                
                <div className="mb-6">
                  <div className={`text-2xl font-bold mb-2 ${
                    currentRank === 1 ? 'text-yellow-400' : 
                    currentRank === 2 ? 'text-gray-300' : 
                    currentRank === 3 ? 'text-amber-600' : 'text-blue-400'
                  }`}>
                    #{currentRank} Place
                  </div>
                  {currentRank <= 3 && (
                    <div className="text-lg text-green-400 font-bold">
                      🎁 {tournament.prizePool[currentRank - 1]}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-purple-400 mb-1">{currentPlayer.score}</div>
                    <div className="text-sm text-gray-300">Final Score</div>
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-400 mb-1">{accuracy}%</div>
                    <div className="text-sm text-gray-300">Accuracy</div>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{maxStreak}</div>
                    <div className="text-sm text-gray-300">Best Streak</div>
                  </div>
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-400 mb-1">#{currentRank}</div>
                    <div className="text-sm text-gray-300">Final Rank</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={backToLobby}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <ArrowPathIcon className="w-6 h-6" />
                  New Tournament
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Feedback Overlay */}
          {gameState === 'playing' && problemFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              {problemFeedback === 'correct' ? (
                <div className="flex flex-col items-center">
                  <span className="text-6xl text-green-400">✅</span>
                  <span className="text-xl text-green-300 font-bold mt-2">Correct!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-6xl text-red-400">❌</span>
                  <span className="text-xl text-red-300 font-bold mt-2">Try Again!</span>
                  <span className="text-lg text-gray-400 mt-1">Answer: {currentProblem.answer}</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className="lg:w-80 w-full max-w-xs bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 mt-8 lg:mt-0">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-yellow-400" />
          Live Leaderboard
        </h3>
        
        <div className="space-y-3">
          {tournament.players.slice(0, 10).map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                player.id === 'player-1' 
                  ? 'bg-blue-500/20 border-blue-500/40' 
                  : 'bg-gray-700/30 border-gray-600/30'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                player.rank === 1 ? 'bg-yellow-500 text-black' :
                player.rank === 2 ? 'bg-gray-400 text-black' :
                player.rank === 3 ? 'bg-amber-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {player.rank}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{player.avatar}</span>
                  <span className={`font-bold truncate ${
                    player.id === 'player-1' ? 'text-blue-300' : 'text-white'
                  }`}>
                    {player.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{player.score} pts</span>
                  {player.streak > 0 && (
                    <span className="text-orange-400 flex items-center gap-1">
                      <FireIcon className="w-3 h-3" />
                      {player.streak}
                    </span>
                  )}
                </div>
              </div>
              
              {player.isActive && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </motion.div>
          ))}
        </div>
        
        {tournament.players.length > 10 && (
          <div className="text-center text-gray-400 text-sm mt-4">
            +{tournament.players.length - 10} more players
          </div>
        )}
      </div>
    </div>
  );
};

export default NumberDojoNinja;