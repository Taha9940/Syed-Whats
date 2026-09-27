import React, { useState } from 'react';
import { Search, Pin, Check, CheckCheck, Clock, Plus, Users, User as UserIcon } from 'lucide-react';
import { Chat, User } from '../../types';
import { storage } from '../../services/storage';

interface ChatListProps {
  chats: Chat[];
  activeChatId?: string;
  currentUser: User;
  onSelectChat: (chat: Chat) => void;
  onOpenNewChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  currentUser,
  onSelectChat,
  onOpenNewChat,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const allUsers = storage.getAllUsers();

  const getChatInfo = (chat: Chat) => {
    if (chat.type === 'group') {
      return {
        title: chat.name || 'Group Chat',
        avatar: chat.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=group',
        isGroup: true,
        online: false,
        uid: undefined,
      };
    }
    const otherId = chat.participants.find((p) => p !== currentUser.id);
    const otherUser = allUsers.find((u) => u.id === otherId);
    return {
      title: otherUser?.username || 'Contact',
      avatar: otherUser?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user',
      isGroup: false,
      online: otherUser?.online || false,
      uid: otherUser?.uid,
    };
  };

  const filtered = chats.filter((c) => {
    const info = getChatInfo(c);
    const query = filterQuery.toLowerCase();
    const matchTitle = info.title.toLowerCase().includes(query);
    const matchUID = info.uid ? info.uid.toString().includes(query) : false;
    const matchLastMsg = c.lastMessage?.text?.toLowerCase().includes(query) || false;
    return matchTitle || matchUID || matchLastMsg;
  });

  const formatElapsed = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#16222F] border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search chats, contacts, or UID..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
          />
        </div>
      </div>

      {/* Chats Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-xs font-semibold">No conversations found</p>
            <button
              onClick={onOpenNewChat}
              className="mt-3 px-3 py-1.5 rounded-xl bg-[#16B8A6] text-white text-xs font-bold"
            >
              Start New Message
            </button>
          </div>
        ) : (
          filtered.map((chat) => {
            const info = getChatInfo(chat);
            const isActive = chat.id === activeChatId;
            const lastMsg = chat.lastMessage;
            const unread = chat.unreadCount?.[currentUser.id] || 0;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors relative select-none ${
                  isActive
                    ? 'bg-[#16B8A6]/10 dark:bg-[#16B8A6]/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Avatar with status dot */}
                <div className="relative shrink-0">
                  <img
                    src={info.avatar}
                    alt={info.title}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  {!info.isGroup && info.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#16222F]" />
                  )}
                </div>

                {/* Body details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {info.title}
                      </h4>
                      {info.uid && (
                        <span className="text-[10px] font-mono text-slate-400 font-semibold shrink-0">
                          #{info.uid.toString().slice(-4)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                      {formatElapsed(chat.updatedAt)}
                    </span>
                  </div>

                  {/* Last message row */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2 flex items-center gap-1">
                      {lastMsg?.senderId === currentUser.id && (
                        <span className="shrink-0 text-slate-400">
                          {lastMsg.status === 'read' ? (
                            <CheckCheck size={13} className="text-[#16B8A6]" />
                          ) : (
                            <Check size={13} />
                          )}
                        </span>
                      )}
                      <span className="truncate">
                        {lastMsg ? (
                          lastMsg.text ||
                          (lastMsg.voiceNote
                            ? '🎤 Voice note'
                            : lastMsg.attachments?.[0]?.name || 'Attachment')
                        ) : (
                          'No messages yet'
                        )}
                      </span>
                    </p>

                    <div className="flex items-center gap-1 shrink-0">
                      {chat.pinned && <Pin size={13} className="text-slate-400 fill-current" />}
                      {unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#16B8A6] text-white text-[10px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button: New Chat / User Search */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-white dark:bg-[#16222F]">
        <button
          onClick={onOpenNewChat}
          className="w-full py-2.5 rounded-xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>Start New Private Message</span>
        </button>
      </div>
    </div>
  );
};
