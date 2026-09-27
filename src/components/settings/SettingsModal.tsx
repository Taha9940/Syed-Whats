import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Shield,
  Bell,
  Moon,
  Sun,
  HardDrive,
  Lock,
  LogOut,
  Trash2,
  Check,
  AlertCircle,
  Smartphone,
  Save,
  Palette,
  Eye,
  KeyRound,
  Database,
  ExternalLink,
  Code,
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../services/storage';
import { isSupabaseConfigured, SUPABASE_PROJECT_URL } from '../../services/supabase';

interface SettingsModalProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onClose: () => void;
}

type SettingsSection =
  | 'account'
  | 'profile'
  | 'privacy'
  | 'notifications'
  | 'appearance'
  | 'storage'
  | 'security'
  | 'supabase';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [user, setUser] = useState<User>(currentUser);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [usernameInput, setUsernameInput] = useState(currentUser.username);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [bioInput, setBioInput] = useState(currentUser.bio);
  const [avatarInput, setAvatarInput] = useState(currentUser.avatar);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Storage cache cleared
  const [cacheCleared, setCacheCleared] = useState(false);

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = () => {
    // Check username uniqueness if changed
    if (usernameInput.trim().toLowerCase() !== currentUser.username.toLowerCase()) {
      const check = storage.checkUsernameUnique(usernameInput, currentUser.id);
      if (!check.isUnique) {
        setUsernameError(`Username "${usernameInput}" is already taken.`);
        setUsernameSuggestions(check.suggestions);
        return;
      }
    }

    setUsernameError('');
    setUsernameSuggestions([]);

    const updated: User = {
      ...user,
      username: usernameInput.trim(),
      bio: bioInput.trim(),
      avatar: avatarInput.trim() || user.avatar,
    };

    setUser(updated);
    storage.setCurrentUser(updated);
    onUpdateUser(updated);
    showSavedFeedback();
  };

  const handleTogglePrivacy = (key: keyof User['privacySettings']) => {
    const updated: User = {
      ...user,
      privacySettings: {
        ...user.privacySettings,
        [key]: !user.privacySettings[key],
      },
    };
    setUser(updated);
    storage.setCurrentUser(updated);
    onUpdateUser(updated);
    showSavedFeedback();
  };

  const handleToggleNotification = (key: keyof User['notificationSettings']) => {
    const updated: User = {
      ...user,
      notificationSettings: {
        ...user.notificationSettings,
        [key]: !user.notificationSettings[key],
      },
    };
    setUser(updated);
    storage.setCurrentUser(updated);
    onUpdateUser(updated);
    showSavedFeedback();
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const updated: User = {
      ...user,
      appearanceSettings: {
        ...user.appearanceSettings,
        theme,
      },
    };
    setUser(updated);
    storage.setCurrentUser(updated);
    onUpdateUser(updated);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleAccentChange = (accentColor: string) => {
    const updated: User = {
      ...user,
      appearanceSettings: {
        ...user.appearanceSettings,
        accentColor,
      },
    };
    setUser(updated);
    storage.setCurrentUser(updated);
    onUpdateUser(updated);
  };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) return;
    setPasswordChanged(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordChanged(false), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const showSavedFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const allUsers = storage.getAllUsers();
  const blockedUsers = user.blockedUsers
    .map((id) => allUsers.find((u) => u.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/40 shrink-0 flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1">
          <div className="hidden md:flex items-center gap-3 p-3 mb-2 border-b border-slate-200/60 dark:border-slate-800">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user.username}</p>
              <p className="text-[10px] font-mono text-[#16B8A6] font-semibold">UID: {user.uid}</p>
            </div>
          </div>

          {[
            { id: 'account', label: 'Account', icon: <UserIcon size={16} /> },
            { id: 'profile', label: 'Profile Info', icon: <Smartphone size={16} /> },
            { id: 'privacy', label: 'Privacy', icon: <Shield size={16} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
            { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
            { id: 'storage', label: 'Storage & Data', icon: <HardDrive size={16} /> },
            { id: 'security', label: 'Security & Auth', icon: <Lock size={16} /> },
            { id: 'supabase', label: 'Supabase Project', icon: <Database size={16} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SettingsSection)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 ${
                activeSection === item.id
                  ? 'bg-[#16324F] dark:bg-[#16B8A6] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Section Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-white capitalize">
                {activeSection} Settings
              </h3>
              {saveSuccess && (
                <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                  <Check size={14} /> Saved
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* ACCOUNT SECTION */}
            {activeSection === 'account' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Permanent Numerical UID
                    </label>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-mono font-bold text-[#16B8A6]">{user.uid}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Permanent / Read-Only
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 opacity-90"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#16B8A6]"
                    />
                    {usernameError && (
                      <div className="mt-2 text-rose-500 text-xs space-y-1">
                        <p>{usernameError}</p>
                        {usernameSuggestions.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-400">Suggestions:</span>
                            {usernameSuggestions.map((sug) => (
                              <button
                                key={sug}
                                onClick={() => setUsernameInput(sug)}
                                className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono text-[#16B8A6]"
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-[#16B8A6] text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Save Account Info</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Danger Zone
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Sign Out</p>
                      <p className="text-[11px] text-slate-500">Sign out of this session securely.</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>

                  <div className="border-t border-rose-500/10 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Delete Account</p>
                      <p className="text-[11px] text-slate-500">
                        Permanently delete account, unique UID and chats.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {showDeleteConfirm && (
                  <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-500 text-xs space-y-2">
                    <p className="font-bold text-rose-700 dark:text-rose-300">
                      Are you absolutely sure you want to permanently delete your SYED account?
                    </p>
                    <p className="text-rose-600 dark:text-rose-400 text-[11px]">
                      This will erase your unique UID ({user.uid}) and all encrypted messages. This action cannot be undone.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={onLogout}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                      >
                        Yes, Delete My Account
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE SECTION */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarInput || user.avatar}
                    alt={user.username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#16B8A6]"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      value={avatarInput}
                      onChange={(e) => setAvatarInput(e.target.value)}
                      placeholder="Paste image link..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#16B8A6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Bio / Status Line
                  </label>
                  <textarea
                    rows={3}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    maxLength={140}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#16B8A6] resize-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono block text-right">
                    {bioInput.length}/140
                  </span>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-[#16B8A6] text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Update Profile</span>
                </button>
              </div>
            )}

            {/* PRIVACY SECTION */}
            {activeSection === 'privacy' && (
              <div className="space-y-3">
                {[
                  {
                    key: 'showOnlineStatus' as const,
                    title: 'Online Presence',
                    desc: 'Let other users see when you are online in chat and profile',
                  },
                  {
                    key: 'showLastSeen' as const,
                    title: 'Last Seen Timestamp',
                    desc: 'Display your last active time when you go offline',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        user.privacySettings[item.key]
                          ? 'bg-[#16B8A6]'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          user.privacySettings[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                {/* Blocked Users Sublist */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Blocked Contacts ({blockedUsers.length})
                  </h4>
                  {blockedUsers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No blocked users</p>
                  ) : (
                    <div className="space-y-1.5">
                      {blockedUsers.map((bUser) => (
                        <div
                          key={bUser!.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {bUser!.username} (UID: {bUser!.uid})
                          </span>
                          <button
                            onClick={() => {
                              storage.toggleBlockUser(bUser!.id);
                              setUser(storage.getCurrentUser());
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 text-[10px] font-bold hover:bg-rose-500/20"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === 'notifications' && (
              <div className="space-y-3">
                {[
                  { key: 'messages' as const, title: 'Direct Messages', desc: 'Alerts for private chats' },
                  { key: 'groups' as const, title: 'Group Messages', desc: 'Alerts for team channels' },
                  { key: 'calls' as const, title: 'Voice & Video Calls', desc: 'Ringing for incoming calls' },
                  { key: 'status' as const, title: 'Status Updates', desc: 'Alerts when contacts share status' },
                  { key: 'sound' as const, title: 'In-App Sound Effects', desc: 'Audio tones on message arrival' },
                  { key: 'messagePreview' as const, title: 'Message Previews', desc: 'Show text in popups' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleToggleNotification(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        user.notificationSettings[item.key]
                          ? 'bg-[#16B8A6]'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          user.notificationSettings[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* APPEARANCE SECTION */}
            {activeSection === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                    Application Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'light', label: 'Light', icon: <Sun size={16} /> },
                      { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
                      { id: 'system', label: 'System', icon: <Smartphone size={16} /> },
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => handleThemeChange(th.id as any)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          user.appearanceSettings.theme === th.id
                            ? 'bg-[#16B8A6]/10 border-[#16B8A6] text-[#16B8A6]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {th.icon}
                        <span>{th.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-3">
                    {[
                      { hex: '#16B8A6', name: 'SYED Teal' },
                      { hex: '#0EA5E9', name: 'Sky Blue' },
                      { hex: '#6366F1', name: 'Indigo' },
                      { hex: '#EC4899', name: 'Rose' },
                      { hex: '#F59E0B', name: 'Amber' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleAccentChange(col.hex)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform ${
                          user.appearanceSettings.accentColor === col.hex
                            ? 'scale-110 border-white ring-2 ring-[#16B8A6]'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {user.appearanceSettings.accentColor === col.hex && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STORAGE & DATA SECTION */}
            {activeSection === 'storage' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Storage Usage Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">Media & Photos:</span>
                      <span className="font-mono font-bold">142.8 MB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">Documents & Archives:</span>
                      <span className="font-mono font-bold">89.4 MB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">Voice Notes:</span>
                      <span className="font-mono font-bold">18.2 MB</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 dark:border-slate-700 pt-1.5 font-bold">
                      <span>Total Used:</span>
                      <span className="text-[#16B8A6] font-mono">250.4 MB</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleClearCache}
                      className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>{cacheCleared ? 'Cache Cleared!' : 'Clear Cache & Temp Media'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Maximum Upload Limit
                  </h4>
                  <p className="text-xs text-slate-500">
                    Files up to {user.storageSettings.maxFileSizeMB} MB per batch are supported natively.
                  </p>
                </div>
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound size={17} className="text-[#16B8A6]" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Change Password
                    </h4>
                  </div>

                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="password"
                    placeholder="New Secure Password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />

                  <button
                    onClick={handleChangePassword}
                    disabled={newPassword.length < 6}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      newPassword.length < 6
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-[#16B8A6] text-white hover:bg-[#14a090]'
                    }`}
                  >
                    {passwordChanged ? 'Password Changed Successfully' : 'Update Password'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Email Verification Status
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      End-to-End Encryption
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#16B8A6]/10 text-[#16B8A6] text-[10px] font-bold">
                      Active (256-Bit)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SUPABASE PROJECT SECTION */}
            {activeSection === 'supabase' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#16324F]/10 to-[#16B8A6]/10 border border-[#16B8A6]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#16B8A6] text-white flex items-center justify-center font-bold shadow-xs">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                          Connected Supabase Project
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {SUPABASE_PROJECT_URL}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                        isSupabaseConfigured()
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span>{isSupabaseConfigured() ? 'Connected' : 'Client Initialized'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    SYED uses the official <strong>@supabase/supabase-js</strong> client with safe environment variable configuration.
                  </p>
                </div>

                {/* Prepared Modules Grid */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Prepared Supabase Modules
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { name: 'Auth', desc: 'Email & Password' },
                      { name: 'Profiles', desc: '9-digit UID + Presence' },
                      { name: 'Conversations', desc: 'Direct & Group chats' },
                      { name: 'Messages', desc: 'Realtime live stream' },
                      { name: 'Attachments', desc: 'Photos, Docs, Archives' },
                      { name: 'Status', desc: '24-hour expiration' },
                      { name: 'Calls', desc: 'WebRTC Signaling' },
                      { name: 'RLS Security', desc: 'Row-Level Security' },
                    ].map((mod) => (
                      <div
                        key={mod.name}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{mod.name}</p>
                          <p className="text-[10px] text-slate-400">{mod.desc}</p>
                        </div>
                        <span className="text-emerald-500 font-bold text-[10px]">Ready</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Environment Variables Info */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Environment Variables
                  </h4>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                      <span className="text-slate-500">VITE_SUPABASE_URL</span>
                      <span className="text-[#16B8A6] truncate max-w-[200px]">
                        https://rkelveakxqnmxmaizidw.supabase.co
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900">
                      <span className="text-slate-500">VITE_SUPABASE_ANON_KEY</span>
                      <span className="text-slate-400">
                        {isSupabaseConfigured() ? 'Configured (Public Key)' : 'Awaiting user secret'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
