import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppKitButton } from '@reown/appkit/react'; // Import AppKitButton
import {
  HomeIcon,
  PlayIcon,
  TrophyIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  // WalletIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Game Lobby', href: '/lobby', icon: PlayIcon },
    { name: 'Tournaments', href: '/tournaments', icon: TrophyIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: ChartBarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo - Far Left */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <BoltIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
                  Lightning Arcade
                </span>
              </Link>
            </div>

            {/* Center - Desktop Navigation */}
            <div className="hidden md:flex flex-1 items-center justify-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group
                      ${isActive(item.href)
                        ? 'text-blue-400 bg-blue-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side - Network & Wallet - Far Right */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Somnia Testnet</span>
              </div>
              <AppKitButton /> {/* Use AppKitButton */}
            </div>

            {/* Mobile - Spacer and Menu Button */}
            <div className="flex-1 md:hidden"></div>
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
              >
                {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            {/* Mobile Menu */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 w-80 h-full bg-slate-900 border-l border-slate-700/50 md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <span className="text-lg font-semibold text-white">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                        ${isActive(item.href)
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Somnia Testnet</span>
                </div>
                <AppKitButton /> {/* Replace custom button with AppKitButton */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;