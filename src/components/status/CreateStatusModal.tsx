import React, { useState, useRef } from 'react';
import { X, Type, Image as ImageIcon, Send, Sparkles, AlertCircle } from 'lucide-react';
import { storage } from '../../services/storage';

interface CreateStatusModalProps {
  onCreated: () => void;
  onClose: () => void;
}

const GRADIENTS = [
  'from-[#16324F] to-[#101820]',
  'from-[#16B8A6] to-[#0F766E]',
  'from-[#3B82F6] to-[#1D4ED8]',
  'from-[#8B5CF6] to-[#6D28D9]',
  'from-[#EC4899] to-[#BE185D]',
  'from-[#F59E0B] to-[#B45309]',
  'from-[#111827] to-[#1F2937]',
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({ onCreated, onClose }) => {
  const [mode, setMode] = useState<'text' | 'media'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMode('media');
    }
  };

  const handleShare = async () => {
    if (mode === 'text') {
      if (!textContent.trim()) return;
      storage.createStatus({
        type: 'text',
        content: textContent.trim(),
        backgroundColor: selectedGradient,
      });
      onCreated();
    } else {
      if (!mediaFile || !mediaPreview) return;
      const isVideo = mediaFile.type.startsWith('video/');

      // Read as data URL for persistent storage
      const reader = new FileReader();
      reader.onload = () => {
        storage.createStatus({
          type: isVideo ? 'video' : 'photo',
          content: reader.result as string,
          caption: caption.trim() || undefined,
        });
        onCreated();
      };
      reader.readAsDataURL(mediaFile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#16B8A6]" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Create Status Update</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2 bg-slate-50 dark:bg-slate-900/40">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'text'
                ? 'bg-white dark:bg-[#16324F] text-[#16B8A6] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type size={16} />
            <span>Text Status</span>
          </button>
          <button
            onClick={() => {
              setMode('media');
              if (!mediaPreview) fileInputRef.current?.click();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'media'
                ? 'bg-white dark:bg-[#16324F] text-[#16B8A6] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon size={16} />
            <span>Photo / Video Status</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          {mode === 'text' ? (
            <div className="space-y-4">
              {/* Text Card Canvas */}
              <div
                className={`w-full h-56 rounded-2xl bg-gradient-to-br ${selectedGradient} flex items-center justify-center p-6 text-white text-center shadow-inner relative transition-all duration-300`}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type your status update..."
                  maxLength={280}
                  className="w-full h-full bg-transparent border-none text-white text-lg font-semibold placeholder:text-white/60 focus:outline-none resize-none text-center flex items-center"
                />
                <span className="absolute bottom-3 right-4 text-[10px] opacity-70 font-mono">
                  {textContent.length}/280
                </span>
              </div>

              {/* Gradient selector */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
                  Choose Color Theme:
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {GRADIENTS.map((grad, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGradient(grad)}
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} shrink-0 border-2 transition-transform ${
                        selectedGradient === grad ? 'scale-110 border-[#16B8A6]' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaPreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-black max-h-64 flex items-center justify-center">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} controls className="max-h-64 w-full" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="max-h-64 object-contain" />
                  )}
                  <button
                    onClick={() => {
                      setMediaPreview(null);
                      setMediaFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#16B8A6] text-slate-500 hover:text-[#16B8A6] transition-colors"
                >
                  <ImageIcon size={32} />
                  <span className="text-xs font-semibold">Select Photo or Video</span>
                  <span className="text-[11px] opacity-75">Supports JPG, PNG, WEBP, MP4</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div>
                <input
                  type="text"
                  placeholder="Add a caption (optional)..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
                />
              </div>
            </div>
          )}

          {/* Privacy & 24h note */}
          <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <AlertCircle size={15} className="shrink-0 text-[#16B8A6]" />
            <span>
              Statuses disappear automatically after <strong>24 hours</strong>. Only your permitted contacts can view.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={mode === 'text' ? !textContent.trim() : !mediaPreview}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              (mode === 'text' ? !textContent.trim() : !mediaPreview)
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#16B8A6] hover:bg-[#14a090] text-white shadow-md'
            }`}
          >
            <Send size={15} />
            <span>Share Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
