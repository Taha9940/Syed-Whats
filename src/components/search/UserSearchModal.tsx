import React, { useState } from 'react';
import { Search, X, MessageSquare, Phone, Video, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../services/storage';

interface UserSearchModalProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onStartVoiceCall: (user: User) => void;
  onStartVideoCall: (user: User) => void;
  onClose: () => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  currentUser,
  onSelectUser,
  onStartVoiceCall,
  onStartVideoCall,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const searchResults = storage.searchUsers(query, currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Search size={18} className="text-[#16B8A6]" />
              Discover Users
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find contacts by Username or permanent 9-digit UID
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Enter username (e.g. Rehan) or numerical UID (e.g. 583927461)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <UserIcon size={36} className="mx-auto opacity-40 text-[#16B8A6]" />
              <p className="text-xs font-medium">Type a username or permanent UID to search</p>
              <div className="flex justify-center gap-2 pt-2 flex-wrap">
                {['Rehan', 'SyedTaha', 'Ahmed', 'Sarah_K', '492018374'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:border-[#16B8A6] border border-transparent"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No users found</p>
              <p className="text-xs mt-1">Check spelling or verify the 9-digit UID number.</p>
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-[#16B8A6]/40 transition-colors"
              >
                <div
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    {user.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {user.username}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold">
                        UID: {user.uid}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.bio}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {user.online ? 'Active now' : user.lastSeen || 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons: Message, Voice Call, Video Call */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className="w-8 h-8 rounded-full bg-[#16324F] hover:bg-[#112438] text-white flex items-center justify-center transition-colors"
                    title="Send message"
                  >
                    <MessageSquare size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onStartVoiceCall(user);
                    }}
                    className="w-8 h-8 rounded-full bg-[#16B8A6] hover:bg-[#14a090] text-white flex items-center justify-center transition-colors"
                    title="Voice call"
                  >
                    <Phone size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onStartVideoCall(user);
                    }}
                    className="w-8 h-8 rounded-full bg-[#16B8A6] hover:bg-[#14a090] text-white flex items-center justify-center transition-colors"
                    title="Video call"
                  >
                    <Video size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Private communication lookup</span>
          <span className="font-mono text-[#16B8A6]">Permanent Numerical UID System</span>
        </div>
      </div>
    </div>
  );
};
