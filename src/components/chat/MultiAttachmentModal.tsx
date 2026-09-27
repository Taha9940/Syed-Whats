import React, { useState, useRef } from 'react';
import { X, Plus, UploadCloud, FileText, Archive, Film, Music, Check, AlertCircle } from 'lucide-react';
import { FileAttachment } from '../../types';
import { formatBytes, detectFileType, processImageFile } from '../../utils/fileHelpers';

interface MultiAttachmentModalProps {
  initialFiles: File[];
  maxFileSizeMB?: number;
  onSend: (attachments: FileAttachment[], quality: 'compressed' | 'original') => void;
  onClose: () => void;
}

interface StagedItem {
  file: File;
  previewUrl: string;
  type: FileAttachment['type'];
  isCompressible: boolean;
}

export const MultiAttachmentModal: React.FC<MultiAttachmentModalProps> = ({
  initialFiles,
  maxFileSizeMB = 500,
  onSend,
  onClose,
}) => {
  const [items, setItems] = useState<StagedItem[]>(() => {
    return initialFiles.map((file) => {
      const type = detectFileType(file);
      const isImg = type === 'image';
      return {
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : '',
        type,
        isCompressible: isImg || type === 'video',
      };
    });
  });

  const [quality, setQuality] = useState<'compressed' | 'original'>('compressed');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalSize = items.reduce((acc, it) => acc + it.file.size, 0);
  const maxBytes = maxFileSizeMB * 1024 * 1024;
  const isOverLimit = totalSize > maxBytes;

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const newItems: StagedItem[] = newFiles.map((file) => {
      const type = detectFileType(file);
      const isImg = type === 'image';
      return {
        file,
        previewUrl: isImg ? URL.createObjectURL(file) : '',
        type,
        isCompressible: isImg || type === 'video',
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const target = items[index];
    if (target.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (items.length === 0 || isOverLimit) return;
    setIsProcessing(true);

    const attachments: FileAttachment[] = [];

    for (const item of items) {
      if (item.type === 'image') {
        const { url, size } = await processImageFile(item.file, quality === 'compressed');
        attachments.push({
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: item.file.name,
          size,
          type: 'image',
          mimeType: item.file.type,
          url,
          quality,
          uploadProgress: 100,
        });
      } else {
        // Other files: read as Data URL or use blob
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('#');
          reader.readAsDataURL(item.file);
        });

        attachments.push({
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: item.file.name,
          size: item.file.size,
          type: item.type,
          mimeType: item.file.type,
          url: dataUrl,
          quality,
          uploadProgress: 100,
        });
      }
    }

    setIsProcessing(false);
    onSend(attachments, quality);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <UploadCloud size={20} className="text-[#16B8A6]" />
              Share Files & Media
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {items.length} file{items.length !== 1 ? 's' : ''} selected • Total: {formatBytes(totalSize)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quality Mode Toggle */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-300">Media Compression:</span>
          <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setQuality('compressed')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                quality === 'compressed'
                  ? 'bg-white dark:bg-[#16324F] text-[#16B8A6] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Compressed (Faster)
            </button>
            <button
              onClick={() => setQuality('original')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                quality === 'original'
                  ? 'bg-white dark:bg-[#16324F] text-[#16B8A6] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Original Quality (Full HD)
            </button>
          </div>
        </div>

        {/* Items Grid & List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isOverLimit && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                Total files size exceeds the configured maximum limit of {maxFileSizeMB} MB. Please remove some files.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 overflow-hidden flex flex-col p-2.5 transition-all hover:border-[#16B8A6]/60 shadow-xs"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                  title="Remove file"
                >
                  <X size={13} />
                </button>

                {/* Preview or Icon */}
                <div className="w-full h-24 rounded-lg bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden mb-2">
                  {item.type === 'image' && item.previewUrl ? (
                    <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
                  ) : item.type === 'video' ? (
                    <Film size={28} className="text-indigo-400" />
                  ) : item.type === 'audio' ? (
                    <Music size={28} className="text-teal-400" />
                  ) : item.type === 'archive' ? (
                    <Archive size={28} className="text-amber-400" />
                  ) : (
                    <FileText size={28} className="text-blue-400" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-100" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatBytes(item.file.size)}
                  </p>
                </div>
              </div>
            ))}

            {/* Add More Files Card */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-36 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#16B8A6] flex flex-col items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-[#16B8A6] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Plus size={20} />
              </div>
              <span className="text-xs font-medium">Add Files</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAddMoreFiles}
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={items.length === 0 || isOverLimit || isProcessing}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              items.length === 0 || isOverLimit || isProcessing
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#16B8A6] hover:bg-[#14a090] text-white shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing Files...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Send {items.length} Attachment{items.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
