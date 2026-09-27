import React, { useState } from 'react';
import { Users, Plus, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import { Chat, User } from '../../types';
import { storage } from '../../services/storage';
import { CreateGroupModal } from './CreateGroupModal';

interface GroupsTabProps {
  currentUser: User;
  onSelectGroup: (chat: Chat) => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ currentUser, onSelectGroup }) => {
  const [chats, setChats] = useState<Chat[]>(() => storage.getChats());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const groupChats = chats.filter((c) => c.type === 'group');

  const refreshGroups = () => {
    setChats(storage.getChats());
  };

  const formatElapsed = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F7F9FC] dark:bg-[#101820]">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#16222F]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Users size={22} className="text-[#16B8A6]" />
              Group Channels
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Private and encrypted multi-user collaboration spaces with complete file and media sharing.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-3">
        {groupChats.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#16222F] border border-slate-200/80 dark:border-slate-800/80 text-slate-400">
            <Users size={36} className="mx-auto mb-2 opacity-40 text-[#16B8A6]" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active groups</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Create a private group to communicate and share files with multiple contacts.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-[#16B8A6] text-white text-xs font-bold"
            >
              Create Group Now
            </button>
          </div>
        ) : (
          groupChats.map((group) => {
            const isAdmin = group.adminIds?.includes(currentUser.id);
            const lastMsg = group.lastMessage;

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="p-4 rounded-2xl bg-white dark:bg-[#16222F] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-[#16B8A6]/50 transition-all cursor-pointer flex items-center gap-4 group"
              >
                <img
                  src={group.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=group'}
                  alt={group.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-[#16B8A6] transition-colors">
                        {group.name}
                      </h3>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#16B8A6]/20 text-[#16B8A6] text-[9px] font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {formatElapsed(group.updatedAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {group.description || `${group.participants.length} members`}
                  </p>

                  {lastMsg && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1 flex items-center gap-1 opacity-90">
                      <span className="font-semibold text-[#16B8A6]">{lastMsg.senderName}:</span>
                      <span>{lastMsg.text || 'Shared attachment'}</span>
                    </p>
                  )}
                </div>

                <ArrowRight
                  size={16}
                  className="text-slate-400 group-hover:text-[#16B8A6] group-hover:translate-x-1 transition-all shrink-0"
                />
              </div>
            );
          })
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          currentUser={currentUser}
          onGroupCreated={(newGroup) => {
            setShowCreateModal(false);
            refreshGroups();
            onSelectGroup(newGroup);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
