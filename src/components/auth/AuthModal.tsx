import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { SyedLogo } from '../SyedLogo';
import { storage } from '../../services/storage';
import { User } from '../../types';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [resetSuccess, setResetSuccess] = useState(false);

  const allUsers = storage.getAllUsers();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await storage.loginUser(email, password);
    if (!res.success || !res.user) {
      setError(res.error || 'Login failed. Please verify credentials.');
      return;
    }
    onSuccess(res.user);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuggestions([]);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const res = await storage.registerUser({
      email,
      password,
      username,
      bio,
    });

    if (!res.success || !res.user) {
      setError(res.error || 'Registration failed.');
      if (res.suggestions) setSuggestions(res.suggestions);
      return;
    }

    onSuccess(res.user);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResetSuccess(true);
  };

  const handleQuickLogin = (demoUser: User) => {
    storage.setCurrentUser(demoUser);
    onSuccess(demoUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#101820] via-[#16324F] to-[#0A1118] text-white">
      <div className="w-full max-w-md bg-white dark:bg-[#16222F] text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden relative">
        {/* Logo and Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-2">
            <SyedLogo size="lg" withContainer />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#16324F] dark:text-white">
            SYED
          </h1>
          <p className="text-xs font-semibold text-[#16B8A6] uppercase tracking-wider mt-0.5">
            Private Messaging & Communication
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No phone numbers required • Instant 9-digit UID allocation
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            <p className="font-bold">{error}</p>
            {suggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-[11px] block text-slate-400">Available alternatives:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setUsername(sug)}
                      className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono font-bold text-[#16B8A6]"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode Selector */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-5">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#16324F] text-[#16B8A6] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#16324F] text-[#16B8A6] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. syed@syedapp.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#16B8A6] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Sign In to SYED</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Unique Username *
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed, Taha, Rehan"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Short Bio / Profession (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Graphic Designer | UI Architect"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#16324F]/10 dark:bg-[#16324F]/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Sparkles size={15} className="text-[#16B8A6] shrink-0" />
              <span>You will automatically receive a permanent 9-digit numerical UID.</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>Register Account</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Password Reset Instructions Sent!
                </p>
                <p className="text-[11px] text-slate-500">
                  Check your inbox for a secure token to reset your password.
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetSuccess(false);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#16B8A6] text-white text-xs font-bold mt-2"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enter your registered email address and we will dispatch a password recovery link.
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#16B8A6]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#16B8A6] text-white text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Quick Demo Account Selector */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Or quick sign-in as demonstration user:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {allUsers.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#16B8A6] flex flex-col items-center gap-1 transition-all group"
              >
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="w-7 h-7 rounded-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-full">
                  {u.username}
                </span>
                <span className="text-[9px] font-mono text-slate-400">UID: {u.uid.toString().slice(-4)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
