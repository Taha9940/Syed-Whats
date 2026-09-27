import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Paperclip,
  Send,
  Mic,
  Square,
  X,
  FileText,
  Image as ImageIcon,
  Archive,
  Music,
  FolderPlus,
  ShieldAlert,
  Info,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { Chat, Message, User, FileAttachment } from '../../types';
import { storage } from '../../services/storage';
import { supabaseService } from '../../services/supabaseService';
import { MessageBubble } from './MessageBubble';
import { MultiAttachmentModal } from './MultiAttachmentModal';
import { MediaGalleryDrawer } from './MediaGalleryDrawer';
import { ForwardModal } from './ForwardModal';
import { voiceRecorder, formatDuration } from '../../utils/audio';

interface ChatViewProps {
  chat: Chat;
  currentUser: User;
  onBack: () => void;
  onStartVoiceCall: (user: User) => void;
  onStartVideoCall: (user: User) => void;
  onOpenUserProfile: (user: User) => void;
  onOpenGroupInfo: (groupChat: Chat) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chat,
  currentUser,
  onBack,
  onStartVoiceCall,
  onStartVideoCall,
  onOpenUserProfile,
  onOpenGroupInfo,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

  // File picking & staging
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputTypeRef = useRef<string>('*/*');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat messages and listen for updates
  const loadMessages = () => {
    const msgs = storage.getMessages(chat.id);
    setMessages(msgs);
  };

  useEffect(() => {
    // 1. Initial immediate load from local cache
    loadMessages();

    // 2. Fetch latest messages from Supabase (persisting after refresh)
    let isMounted = true;
    storage.syncMessagesFromSupabase(chat.id).then((freshMsgs) => {
      if (isMounted && freshMsgs && freshMsgs.length > 0) {
        setMessages(freshMsgs);
      }
    });

    // 3. Listen for internal app events
    const handleNewMessage = (e: any) => {
      if (e.detail?.chatId === chat.id) {
        loadMessages();
      }
    };
    window.addEventListener('syed:new_message', handleNewMessage);

    // 4. Subscribe to Supabase Realtime channel for live 1-to-1 messaging
    const unsubscribeRealtime = supabaseService.subscribeToConversation(
      chat.id,
      (incomingMsg) => {
        if (!isMounted) return;
        storage.addReceivedMessage(incomingMsg);
        setMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) {
            return prev.map((m) => (m.id === incomingMsg.id ? incomingMsg : m));
          }
          return [...prev, incomingMsg];
        });
      },
      (updatedMsg) => {
        if (!isMounted) return;
        storage.addReceivedMessage(updatedMsg);
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
        );
      }
    );

    return () => {
      isMounted = false;
      window.removeEventListener('syed:new_message', handleNewMessage);
      unsubscribeRealtime();
    };
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Determine chat recipient info
  const isGroup = chat.type === 'group';
  const otherUserId = !isGroup ? chat.participants.find((p) => p !== currentUser.id) : null;
  const otherUser = otherUserId ? storage.getUserById(otherUserId) : null;

  const isBlocked = otherUser ? currentUser.blockedUsers.includes(otherUser.id) : false;
  const isOnlyAdmins = isGroup && chat.onlyAdminsCanSend && !chat.adminIds?.includes(currentUser.id);

  const chatTitle = isGroup ? chat.name || 'Group Chat' : otherUser?.username || 'Chat';
  const chatAvatar = isGroup
    ? chat.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=group'
    : otherUser?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user';

  const handleSendText = () => {
    if (!inputText.trim() || isBlocked || isOnlyAdmins) return;

    storage.sendMessage(
      chat.id,
      inputText,
      undefined,
      undefined,
      replyMessage
        ? {
            id: replyMessage.id,
            senderName: replyMessage.senderName,
            text: replyMessage.text,
          }
        : undefined
    );

    setInputText('');
    setReplyMessage(null);
    loadMessages();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Voice recording
  const handleStartRecording = async () => {
    if (isBlocked || isOnlyAdmins) return;
    setIsRecording(true);
    setRecordingSeconds(0);
    await voiceRecorder.startRecording((sec) => setRecordingSeconds(sec));
  };

  const handleCancelRecording = () => {
    voiceRecorder.cancelRecording();
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleFinishRecording = async () => {
    const voiceNote = await voiceRecorder.stopRecording();
    setIsRecording(false);
    setRecordingSeconds(0);

    if (voiceNote) {
      storage.sendMessage(chat.id, '', undefined, voiceNote);
      loadMessages();
    }
  };

  // File picking
  const triggerFileInput = (accept: string) => {
    fileInputTypeRef.current = accept;
    setShowAttachmentMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStagedFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleSendStagedAttachments = (
    attachments: FileAttachment[],
    quality: 'compressed' | 'original'
  ) => {
    setStagedFiles([]);
    storage.sendMessage(chat.id, '', attachments);
    loadMessages();
  };

  const handleDeleteMessage = (messageId: string, forEveryone: boolean) => {
    storage.deleteMessage(messageId, forEveryone);
    loadMessages();
  };

  const handleForwardMessages = (targetChatIds: string[]) => {
    if (!forwardingMessage) return;
    targetChatIds.forEach((targetId) => {
      const allMsgs = storage.getMessages(targetId);
      const fwd: Message = {
        id: `fwd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        chatId: targetId,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderAvatar: currentUser.avatar,
        text: forwardingMessage.text,
        attachments: forwardingMessage.attachments,
        voiceNote: forwardingMessage.voiceNote,
        timestamp: Date.now(),
        status: 'sent',
        forwarded: true,
      };
      // Send message
      storage.sendMessage(
        targetId,
        forwardingMessage.text,
        forwardingMessage.attachments,
        forwardingMessage.voiceNote
      );
    });
    setForwardingMessage(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F9FC] dark:bg-[#101820] relative overflow-hidden">
      {/* Top Header */}
      <header className="h-16 px-4 bg-white/95 dark:bg-[#16222F]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between z-20 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar and name */}
          <div
            onClick={() => {
              if (isGroup) onOpenGroupInfo(chat);
              else if (otherUser) onOpenUserProfile(otherUser);
            }}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative shrink-0">
              <img
                src={chatAvatar}
                alt={chatTitle}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              {!isGroup && otherUser?.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#16222F] rounded-full" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-[#16B8A6] transition-colors">
                  {chatTitle}
                </h2>
                {!isGroup && otherUser && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                    UID: {otherUser.uid}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {isGroup
                  ? `${chat.participants.length} members • Tap for details`
                  : otherUser?.online
                  ? 'Active now'
                  : otherUser?.lastSeen || 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {!isGroup && otherUser && (
            <>
              <button
                onClick={() => onStartVoiceCall(otherUser)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#16B8A6] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Voice Call"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => onStartVideoCall(otherUser)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#16B8A6] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Video Call"
              >
                <Video size={19} />
              </button>
            </>
          )}

          <button
            onClick={() => setShowGallery(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#16B8A6] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Shared Files & Media"
          >
            <FolderPlus size={18} />
          </button>

          <button
            onClick={() => {
              if (isGroup) onOpenGroupInfo(chat);
              else if (otherUser) onOpenUserProfile(otherUser);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#16B8A6] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Details & Profile"
          >
            <Info size={19} />
          </button>
        </div>
      </header>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Security & Encryption Notice */}
        <div className="flex justify-center my-3 select-none">
          <div className="py-1 px-3 rounded-full bg-slate-200/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs">
            <span className="text-[#16B8A6] font-bold">SYED</span>
            <span>• Private End-to-End Direct Channel</span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500">
            <p className="text-xs">No messages yet. Send a greeting or share files!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={currentUser}
              onReply={(m) => setReplyMessage(m)}
              onForward={(m) => setForwardingMessage(m)}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Blocked or Read-Only Notice */}
      {isBlocked ? (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium">
          <ShieldAlert size={16} />
          <span>You have blocked this contact. Unblock to send messages or make calls.</span>
        </div>
      ) : isOnlyAdmins ? (
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 text-xs">
          <span>Only group administrators can send messages in this group.</span>
        </div>
      ) : (
        /* Input & Controls Area */
        <footer className="p-3 bg-white dark:bg-[#16222F] border-t border-slate-200 dark:border-slate-800 relative z-20">
          {/* Reply Quote Bar */}
          {replyMessage && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-l-4 border-[#16B8A6] flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="truncate pr-2">
                <span className="font-bold text-[#16B8A6] block text-[11px]">
                  Replying to {replyMessage.senderName}
                </span>
                <span className="text-slate-600 dark:text-slate-300 truncate block">
                  {replyMessage.text || 'Attachment'}
                </span>
              </div>
              <button
                onClick={() => setReplyMessage(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Voice recording active bar */}
          {isRecording ? (
            <div className="flex items-center justify-between gap-3 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 rounded-2xl px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  Recording {formatDuration(recordingSeconds)}
                </span>
                <div className="flex items-center gap-0.5 h-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-500 rounded-full animate-audio-bar"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelRecording}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishRecording}
                  className="w-9 h-9 rounded-full bg-[#16B8A6] text-white flex items-center justify-center hover:bg-[#14a090] shadow-md transition-all active:scale-95"
                  title="Send voice note"
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard text & attachment input bar */
            <div className="flex items-center gap-2">
              {/* Attachment Picker Menu Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#16B8A6] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Attach files or media"
                >
                  <Paperclip size={20} />
                </button>

                {/* Dropdown Options */}
                {showAttachmentMenu && (
                  <div className="absolute bottom-12 left-0 w-52 bg-white dark:bg-[#1A2634] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 space-y-0.5 z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <button
                      onClick={() => triggerFileInput('image/*,video/*')}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <ImageIcon size={17} className="text-purple-500" />
                      <span>Photos & Videos</span>
                    </button>
                    <button
                      onClick={() =>
                        triggerFileInput(
                          '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv'
                        )
                      }
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <FileText size={17} className="text-blue-500" />
                      <span>Documents (PDF, Office)</span>
                    </button>
                    <button
                      onClick={() => triggerFileInput('.zip,.rar,.7z,.tar,.gz')}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <Archive size={17} className="text-amber-500" />
                      <span>ZIP & Archives</span>
                    </button>
                    <button
                      onClick={() => triggerFileInput('audio/*')}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <Music size={17} className="text-teal-500" />
                      <span>Audio Files</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />
                    <button
                      onClick={() => triggerFileInput('*/*')}
                      className="w-full px-3 py-2 flex items-center gap-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                    >
                      <FolderPlus size={17} className="text-[#16B8A6]" />
                      <span>Multiple / Any Files</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Type a private message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>

              {/* Send or Voice Note Button */}
              {inputText.trim() ? (
                <button
                  onClick={handleSendText}
                  className="w-10 h-10 rounded-full bg-[#16B8A6] hover:bg-[#14a090] text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
                  title="Send message"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors shrink-0"
                  title="Record voice message"
                >
                  <Mic size={19} />
                </button>
              )}
            </div>
          )}

          {/* Hidden File Picker Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />
        </footer>
      )}

      {/* Multi-Attachment Review Modal */}
      {stagedFiles.length > 0 && (
        <MultiAttachmentModal
          initialFiles={stagedFiles}
          maxFileSizeMB={currentUser.storageSettings.maxFileSizeMB}
          onSend={handleSendStagedAttachments}
          onClose={() => setStagedFiles([])}
        />
      )}

      {/* Media & Files Drawer */}
      {showGallery && (
        <MediaGalleryDrawer
          chatTitle={chatTitle}
          messages={messages}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Forward Modal */}
      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          chats={storage.getChats()}
          users={storage.getAllUsers()}
          currentUser={currentUser}
          onForward={handleForwardMessages}
          onClose={() => setForwardingMessage(null)}
        />
      )}
    </div>
  );
};
