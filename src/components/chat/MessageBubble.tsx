import React, { useState } from 'react';
import { Check, CheckCheck, Clock, AlertCircle, MoreVertical, Reply, Copy, Trash2, CornerUpRight, Info } from 'lucide-react';
import { Message, User } from '../../types';
import { FileBubble } from './FileBubble';
import { VoiceNotePlayer } from './VoiceNotePlayer';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onDelete: (messageId: string, forEveryone: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  onReply,
  onForward,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isOwn = message.senderId === currentUser.id;
  const isDeleted = message.isDeletedForEveryone;

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatus = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case 'sending':
        return <Clock size={12} className="opacity-70" />;
      case 'sent':
        return <Check size={13} className="opacity-80" />;
      case 'delivered':
        return <CheckCheck size={14} className="opacity-80" />;
      case 'read':
        return <CheckCheck size={14} className="text-[#38BDF8] dark:text-[#16B8A6]" />;
      case 'failed':
        return <AlertCircle size={13} className="text-rose-400" />;
    }
  };

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setShowMenu(false);
    }
  };

  if (isDeleted) {
    return (
      <div className={`flex w-full my-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="py-1.5 px-3 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs italic flex items-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-700">
          <Trash2 size={12} />
          <span>This message was deleted</span>
        </div>
      </div>
    );
  }

  const images = message.attachments?.filter((a) => a.type === 'image') || [];
  const videos = message.attachments?.filter((a) => a.type === 'video') || [];
  const otherFiles = message.attachments?.filter((a) => a.type !== 'image' && a.type !== 'video') || [];

  return (
    <div
      className={`group relative flex w-full my-1.5 ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Reply Quote Banner */}
        {message.replyTo && (
          <div
            className={`mb-1 px-3 py-1.5 text-xs rounded-lg border-l-4 truncate max-w-full ${
              isOwn
                ? 'bg-slate-700/40 border-[#16B8A6] text-slate-200'
                : 'bg-slate-200 dark:bg-slate-800 border-[#16324F] dark:border-[#38BDF8] text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="font-bold block text-[11px] text-[#16B8A6] dark:text-[#38BDF8]">
              {message.replyTo.senderName}
            </span>
            <span className="truncate block opacity-80">{message.replyTo.text || 'Attachment'}</span>
          </div>
        )}

        {/* Message Main Card */}
        <div
          className={`relative rounded-2xl px-3.5 py-2.5 shadow-xs transition-shadow ${
            isOwn
              ? 'bg-[#16324F] text-white rounded-br-xs'
              : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs'
          }`}
        >
          {/* Sender Name in group chats for other users */}
          {!isOwn && (
            <p className="text-[11px] font-bold text-[#16B8A6] dark:text-[#38BDF8] mb-1 select-none">
              {message.senderName}
            </p>
          )}

          {/* Forwarded Header */}
          {message.forwarded && (
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1 select-none">
              <CornerUpRight size={11} />
              <span>Forwarded</span>
            </div>
          )}

          {/* Attached Images Grid */}
          {images.length > 0 && (
            <div
              className={`grid gap-1.5 mb-2 rounded-xl overflow-hidden ${
                images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className="relative cursor-pointer overflow-hidden rounded-lg bg-black/20 group/img aspect-4/3 sm:aspect-video"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                  />
                  {img.quality === 'original' && (
                    <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded-sm">
                      HD
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Attached Videos */}
          {videos.length > 0 && (
            <div className="space-y-2 mb-2">
              {videos.map((vid) => (
                <div key={vid.id} className="rounded-xl overflow-hidden bg-black/30">
                  <video src={vid.url} controls className="w-full max-h-60 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Other Files (Documents, Archives, Music) */}
          {otherFiles.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {otherFiles.map((file) => (
                <FileBubble key={file.id} attachment={file} isOwnMessage={isOwn} />
              ))}
            </div>
          )}

          {/* Voice Note Player */}
          {message.voiceNote && (
            <div className="mb-1">
              <VoiceNotePlayer voiceNote={message.voiceNote} isOwnMessage={isOwn} />
            </div>
          )}

          {/* Text Message Content */}
          {message.text && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed select-text font-normal">
              {message.text}
            </p>
          )}

          {/* Timestamp & Status Info */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
              isOwn ? 'text-slate-300/80' : 'text-slate-400 dark:text-slate-400'
            }`}
          >
            <span>{formatTime(message.timestamp)}</span>
            {renderStatus()}
          </div>
        </div>

        {/* Hover / Long-press Action Trigger */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`absolute top-1 ${
            isOwn ? '-left-7' : '-right-7'
          } p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity`}
          title="Message options"
        >
          <MoreVertical size={16} />
        </button>

        {/* Context Menu Popup */}
        {showMenu && (
          <div
            className={`absolute z-30 top-6 ${
              isOwn ? 'right-0' : 'left-0'
            } w-44 bg-white dark:bg-[#1A2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-xs select-none`}
          >
            <button
              onClick={() => {
                onReply(message);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
            >
              <Reply size={14} className="text-[#16B8A6]" />
              <span>Reply</span>
            </button>
            {message.text && (
              <button
                onClick={handleCopy}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
              >
                <Copy size={14} />
                <span>Copy Text</span>
              </button>
            )}
            <button
              onClick={() => {
                onForward(message);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
            >
              <CornerUpRight size={14} />
              <span>Forward</span>
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />
            <button
              onClick={() => {
                onDelete(message.id, false);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
            >
              <Trash2 size={14} />
              <span>Delete for Me</span>
            </button>
            {isOwn && (
              <button
                onClick={() => {
                  onDelete(message.id, true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium"
              >
                <Trash2 size={14} />
                <span>Delete for Everyone</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out"
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
