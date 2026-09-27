import React, { useState } from 'react';
import { X, Search, Check, Send } from 'lucide-react';
import { Chat, Message, User } from '../../types';

interface ForwardModalProps {
  message: Message;
  chats: Chat[];
  users: User[];
  currentUser: User;
  onForward: (targetChatIds: string[]) => void;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  message,
  chats,
  users,
  currentUser,
  onForward,
  onClose,
}) => {
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelect = (chatId: string) => {
    setSelectedChatIds((prev) =>
      prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]
    );
  };

  const getChatDisplay = (chat: Chat) => {
    if (chat.type === 'group') {
      return {
        title: chat.name || 'Group',
        subtitle: `${chat.participants.length} members`,
        avatar: chat.avatar,
      };
    }
    const otherId = chat.participants.find((p) => p !== currentUser.id);
    const otherUser = users.find((u) => u.id === otherId);
    return {
      title: otherUser?.username || 'User',
      subtitle: `UID: ${otherUser?.uid || 'Unknown'}`,
      avatar: otherUser?.avatar,
    };
  };

  const filteredChats = chats.filter((c) => {
    const info = getChatDisplay(c);
    return (
      info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Forward Message</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select one or more chats to forward
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.map((chat) => {
            const info = getChatDisplay(chat);
            const isSelected = selectedChatIds.includes(chat.id);

            return (
              <div
                key={chat.id}
                onClick={() => toggleSelect(chat.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#16B8A6]/10 dark:bg-[#16B8A6]/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={info.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                    alt={info.title}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {info.title}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      {info.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#16B8A6] border-[#16B8A6] text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <Check size={13} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <span className="text-xs text-slate-500">
            {selectedChatIds.length} chat{selectedChatIds.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              if (selectedChatIds.length > 0) {
                onForward(selectedChatIds);
              }
            }}
            disabled={selectedChatIds.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedChatIds.length === 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#16B8A6] hover:bg-[#14a090] text-white shadow-md'
            }`}
          >
            <Send size={14} />
            <span>Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
