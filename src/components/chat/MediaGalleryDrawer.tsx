import React, { useState } from 'react';
import { X, Image as ImageIcon, FileText, Music, Link as LinkIcon, Film, Archive, Download, ExternalLink } from 'lucide-react';
import { Message } from '../../types';
import { formatBytes, getFileExtension, downloadFile } from '../../utils/fileHelpers';

interface MediaGalleryDrawerProps {
  chatTitle: string;
  messages: Message[];
  onClose: () => void;
}

type TabType = 'media' | 'docs' | 'audio' | 'links';

export const MediaGalleryDrawer: React.FC<MediaGalleryDrawerProps> = ({
  chatTitle,
  messages,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('media');

  // Extract all media items
  const allAttachments = messages.flatMap((m) => m.attachments || []);
  const voiceNotes = messages.filter((m) => m.voiceNote).map((m) => m.voiceNote!);

  const mediaItems = allAttachments.filter((a) => a.type === 'image' || a.type === 'video');
  const docItems = allAttachments.filter((a) => a.type === 'document' || a.type === 'archive' || a.type === 'other');
  const audioItems = allAttachments.filter((a) => a.type === 'audio');

  // Extract links from message texts
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkItems = messages
    .filter((m) => m.text && linkRegex.test(m.text))
    .flatMap((m) => {
      const matches = m.text.match(linkRegex) || [];
      return matches.map((url) => ({
        url,
        senderName: m.senderName,
        timestamp: m.timestamp,
      }));
    });

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white dark:bg-[#16222F] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Media, Links & Files</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chatTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('media')}
          className={`py-3 text-center border-b-2 transition-all ${
            activeTab === 'media'
              ? 'border-[#16B8A6] text-[#16B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Media ({mediaItems.length})
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`py-3 text-center border-b-2 transition-all ${
            activeTab === 'docs'
              ? 'border-[#16B8A6] text-[#16B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Docs ({docItems.length})
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`py-3 text-center border-b-2 transition-all ${
            activeTab === 'audio'
              ? 'border-[#16B8A6] text-[#16B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Voice ({voiceNotes.length + audioItems.length})
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`py-3 text-center border-b-2 transition-all ${
            activeTab === 'links'
              ? 'border-[#16B8A6] text-[#16B8A6]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Links ({linkItems.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'media' && (
          <div>
            {mediaItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No shared photos or videos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-lg overflow-hidden bg-black/10 aspect-square"
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <Film size={22} />
                      </div>
                    )}
                    <button
                      onClick={() => downloadFile(item.url, item.name)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-2">
            {docItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No documents or files shared yet</p>
              </div>
            ) : (
              docItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-[#16B8A6]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-lg bg-[#16324F]/10 dark:bg-[#16324F]/40 text-[#16324F] dark:text-cyan-400 flex items-center justify-center shrink-0">
                      {item.type === 'archive' ? <Archive size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {formatBytes(item.size)} • {getFileExtension(item.name)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(item.url, item.name)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-[#16B8A6] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-2">
            {voiceNotes.length === 0 && audioItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Music size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No audio or voice notes yet</p>
              </div>
            ) : (
              voiceNotes.map((vn) => (
                <div
                  key={vn.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#16B8A6]/20 text-[#16B8A6] flex items-center justify-center">
                      <Music size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        Voice Note ({vn.duration}s)
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Audio recording</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(vn.url, `voicenote_${vn.id}.ogg`)}
                    className="p-1.5 text-slate-400 hover:text-[#16B8A6]"
                  >
                    <Download size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-2">
            {linkItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <LinkIcon size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No links shared in this conversation</p>
              </div>
            ) : (
              linkItems.map((lnk, idx) => (
                <a
                  key={idx}
                  href={lnk.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-[#16B8A6] truncate">{lnk.url}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Shared by {lnk.senderName}</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 shrink-0" />
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
