import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Key, Lock, Share2, History, Sun, Moon } from 'lucide-react';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SecureVault</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="icon-btn" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="btn-outline text-sm">Log In</Link>
            <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Shield className="w-20 h-20 text-emerald-500 dark:text-emerald-400 mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          SecureVault
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Your digital fortress. Store, generate, and share passwords with military-grade AES-256 encryption — all behind a PIN-gated vault.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/signup" className="btn-primary text-base px-8 py-3">Get Started</Link>
          <Link to="/login" className="btn-outline text-base px-8 py-3">Log In</Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <Key className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Password Generation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Generate unique, strong passwords instantly</p>
          </div>
          <div className="card p-6 text-center">
            <Lock className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">AES 256 Encryption</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Military-grade encryption for maximum security</p>
          </div>
          <div className="card p-6 text-center">
            <Share2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Secure Sharing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share passwords safely with customizable access levels</p>
          </div>
          <div className="card p-6 text-center">
            <History className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Audit Trails</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track every action with detailed logs</p>
          </div>
        </div>
      </section>
    </div>
  );
}
