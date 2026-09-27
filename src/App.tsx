import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Users,
  MoreHorizontal,
  Search,
  Settings,
  Phone,
  Video,
  Shield,
  UploadCloud,
  FileCheck,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { SyedLogo } from './components/SyedLogo';
import { User, Chat, CallSession } from './types';
import { storage } from './services/storage';
import { supabaseService } from './services/supabaseService';
import { ChatList } from './components/chat/ChatList';
import { ChatView } from './components/chat/ChatView';
import { StatusTab } from './components/status/StatusTab';
import { GroupsTab } from './components/groups/GroupsTab';
import { AboutModal } from './components/about/AboutModal';
import { UserSearchModal } from './components/search/UserSearchModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { GroupInfoModal } from './components/groups/GroupInfoModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { CallModal } from './components/calling/CallModal';

type NavTab = 'messages' | 'status' | 'groups' | 'more';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavTab>('messages');
  const [chats, setChats] = useState<Chat[]>(() => storage.getChats());
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_direct_rehan');

  // Modals state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);
  const [inspectedGroup, setInspectedGroup] = useState<Chat | null>(null);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [copiedUID, setCopiedUID] = useState(false);

  // Sync theme
  useEffect(() => {
    if (currentUser?.appearanceSettings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (currentUser?.appearanceSettings?.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [currentUser?.appearanceSettings?.theme]);

  // Refresh chats on new messages and sync with Supabase
  useEffect(() => {
    const handleNewMessage = () => {
      setChats(storage.getChats());
    };
    window.addEventListener('syed:new_message', handleNewMessage);

    // Initial sync from Supabase on mount / login
    if (currentUser?.id) {
      storage.syncConversationsFromSupabase().then((synced) => {
        if (synced && synced.length > 0) {
          setChats(synced);
        }
      });
    }

    // Subscribe to realtime conversation updates for the user
    const unsubscribeUserChats = currentUser?.id
      ? supabaseService.subscribeToUserConversations(currentUser.id, () => {
          storage.syncConversationsFromSupabase().then((synced) => {
            if (synced && synced.length > 0) {
              setChats(synced);
            }
          });
        })
      : () => {};

    return () => {
      window.removeEventListener('syed:new_message', handleNewMessage);
      unsubscribeUserChats();
    };
  }, [currentUser?.id]);

  const refreshChats = () => {
    setChats(storage.getChats());
  };

  const handleSelectChat = (chat: Chat) => {
    setActiveChatId(chat.id);
  };

  const handleStartDirectChatWithUser = (targetUser: User) => {
    const chat = storage.getOrCreateDirectChat(targetUser.id);
    refreshChats();
    setActiveTab('messages');
    setActiveChatId(chat.id);
  };

  const handleStartCall = (targetUser: User, type: 'voice' | 'video') => {
    setActiveCall({
      id: `call_${Date.now()}`,
      type,
      participant: targetUser,
      isIncoming: false,
      status: 'calling',
      duration: 0,
      isMuted: false,
      isVideoOff: type === 'voice',
      isSpeakerOn: true,
      cameraFacing: 'user',
    });
  };

  const handleCopyMyUID = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.uid.toString());
    setCopiedUID(true);
    setTimeout(() => setCopiedUID(false), 2000);
  };

  if (!currentUser) {
    return <AuthModal onSuccess={(u) => setCurrentUser(u)} />;
  }

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F9FC] dark:bg-[#101820] text-[#17212B] dark:text-slate-100 font-sans">
      {/* LEFT NAVIGATION DOCK / SIDEBAR */}
      <aside className="w-16 sm:w-20 bg-[#16324F] text-white flex flex-col items-center justify-between py-4 z-30 shrink-0 select-none shadow-xl border-r border-slate-700/50">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setShowAboutModal(true)}>
          <SyedLogo size="md" className="transition-transform group-hover:scale-105" />
          <span className="text-[10px] font-black tracking-widest text-[#16B8A6] uppercase mt-0.5">
            SYED
          </span>
        </div>

        {/* Primary Tabs */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {[
            { id: 'messages', label: 'Messages', icon: <MessageSquare size={21} /> },
            { id: 'status', label: 'Status', icon: <Sparkles size={21} /> },
            { id: 'groups', label: 'Groups', icon: <Users size={21} /> },
            { id: 'more', label: 'About', icon: <MoreHorizontal size={21} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'more') {
                    setShowAboutModal(true);
                  } else {
                    setActiveTab(tab.id as NavTab);
                  }
                }}
                className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-[#16B8A6] text-white shadow-lg shadow-[#16B8A6]/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="text-[9px] font-bold tracking-tight leading-none">{tab.label}</span>
                {isActive && (
                  <span className="absolute -left-2 w-1 h-6 bg-[#16B8A6] rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions: User Avatar & Settings */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Application Settings"
          >
            <Settings size={20} />
          </button>

          <div
            onClick={() => setInspectedUser(currentUser)}
            className="relative cursor-pointer group"
            title={`Logged in as ${currentUser.username} (UID: ${currentUser.uid})`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#16B8A6] group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#16324F]" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER: DUAL COLUMN LAYOUT */}
      <div className="flex-1 flex h-full overflow-hidden">
        {/* MIDDLE COLUMN: ACTIVE TAB LIST (Messages, Status, or Groups) */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col h-full bg-white dark:bg-[#16222F] shrink-0 border-r border-slate-200 dark:border-slate-800 ${
            activeChatId && activeTab === 'messages' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Top Global Bar for discovery and permanent UID badge */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
            {/* User permanent UID badge with click to copy */}
            <div
              onClick={handleCopyMyUID}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[#16B8A6] transition-colors group"
              title="Click to copy your unique numerical UID"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  My UID
                </span>
                <span className="text-xs font-mono font-black text-[#16B8A6] group-hover:text-cyan-400 transition-colors">
                  {currentUser.uid}
                </span>
              </div>
              <Copy size={13} className="text-slate-400 group-hover:text-[#16B8A6]" />
            </div>

            {copiedUID && (
              <span className="text-[10px] font-bold text-emerald-500 animate-in fade-in">
                UID Copied!
              </span>
            )}

            {/* Discover Users button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#16324F] hover:bg-[#112438] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Discover users by Username or permanent UID"
            >
              <Search size={14} className="text-[#16B8A6]" />
              <span>Search Users</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'messages' && (
            <ChatList
              chats={chats}
              activeChatId={activeChatId || undefined}
              currentUser={currentUser}
              onSelectChat={handleSelectChat}
              onOpenNewChat={() => setShowSearchModal(true)}
            />
          )}

          {activeTab === 'status' && <StatusTab currentUser={currentUser} />}

          {activeTab === 'groups' && (
            <GroupsTab
              currentUser={currentUser}
              onSelectGroup={(grp) => {
                setActiveTab('messages');
                setActiveChatId(grp.id);
              }}
            />
          )}
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT VIEW OR WELCOME SPLASH */}
        <div
          className={`flex-1 flex flex-col h-full bg-[#F7F9FC] dark:bg-[#101820] overflow-hidden ${
            !activeChatId && activeTab === 'messages' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeChat && activeTab === 'messages' ? (
            <ChatView
              chat={activeChat}
              currentUser={currentUser}
              onBack={() => setActiveChatId(null)}
              onStartVoiceCall={(targetUser) => handleStartCall(targetUser, 'voice')}
              onStartVideoCall={(targetUser) => handleStartCall(targetUser, 'video')}
              onOpenUserProfile={(targetUser) => setInspectedUser(targetUser)}
              onOpenGroupInfo={(grp) => setInspectedGroup(grp)}
            />
          ) : (
            /* Welcome / Empty State Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-gradient-to-b from-[#F7F9FC] to-[#EDF2F7] dark:from-[#101820] dark:to-[#0B132B]">
              <div className="max-w-md flex flex-col items-center">
                <SyedLogo size="2xl" withContainer className="mb-4" />
                <h1 className="text-3xl font-black tracking-tight text-[#16324F] dark:text-white">
                  SYED
                </h1>
                <p className="text-xs font-semibold text-[#16B8A6] uppercase tracking-widest mt-1 mb-4">
                  Private Messaging & Media Transfer
                </p>

                <div className="bg-white/80 dark:bg-[#16222F]/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-left space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16B8A6]/10 text-[#16B8A6] flex items-center justify-center shrink-0">
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        100% Private Communication
                      </p>
                      <p className="text-[11px] text-slate-500">
                        No feeds, no tracking, zero social algorithm noise.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16B8A6]/10 text-[#16B8A6] flex items-center justify-center shrink-0">
                      <UploadCloud size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Multi-File & Media Sharing
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Photos, Videos, PDFs, ZIP archives up to 500 MB.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16B8A6]/10 text-[#16B8A6] flex items-center justify-center shrink-0">
                      <FileCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Permanent 9-Digit Numerical UID
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Discover other users with unique UID without phone numbers.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowSearchModal(true)}
                  className="px-6 py-3 rounded-2xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <Search size={16} />
                  <span>Discover Contacts by UID or Username</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {/* User Discovery / Search Modal */}
      {showSearchModal && (
        <UserSearchModal
          currentUser={currentUser}
          onSelectUser={(u) => handleStartDirectChatWithUser(u)}
          onStartVoiceCall={(u) => handleStartCall(u, 'voice')}
          onStartVideoCall={(u) => handleStartCall(u, 'video')}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {/* User Profile Modal */}
      {inspectedUser && (
        <UserProfileModal
          user={inspectedUser}
          currentUser={currentUser}
          onStartChat={(u) => handleStartDirectChatWithUser(u)}
          onStartVoiceCall={(u) => handleStartCall(u, 'voice')}
          onStartVideoCall={(u) => handleStartCall(u, 'video')}
          onClose={() => setInspectedUser(null)}
        />
      )}

      {/* Group Info Modal */}
      {inspectedGroup && (
        <GroupInfoModal
          groupChat={inspectedGroup}
          currentUser={currentUser}
          onUpdate={refreshChats}
          onClose={() => setInspectedGroup(null)}
          onLeave={() => {
            setInspectedGroup(null);
            setActiveChatId(null);
            refreshChats();
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            refreshChats();
          }}
          onLogout={() => {
            setShowSettingsModal(false);
            setCurrentUser(null);
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* More / About Modal */}
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}

      {/* Live Voice / Video Call Modal */}
      {activeCall && (
        <CallModal
          session={activeCall}
          currentUser={currentUser}
          onEndCall={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
