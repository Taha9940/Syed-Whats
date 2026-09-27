import React, { useState } from 'react';
import { Download, FileText, Archive, FileSpreadsheet, FileCode, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react';
import { FileAttachment } from '../../types';
import { formatBytes, getFileExtension, getFileTypeBadgeColor, downloadFile } from '../../utils/fileHelpers';

interface FileBubbleProps {
  attachment: FileAttachment;
  isOwnMessage: boolean;
}

export const FileBubble: React.FC<FileBubbleProps> = ({ attachment, isOwnMessage }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [failed, setFailed] = useState(attachment.uploadFailed || false);

  const ext = getFileExtension(attachment.name);
  const badgeStyle = getFileTypeBadgeColor(attachment.type, ext);

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setFailed(false);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setDownloading(false);
          setIsDownloaded(true);
          downloadFile(attachment.url, attachment.name);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const getIcon = () => {
    if (attachment.type === 'archive') return <Archive size={22} className={badgeStyle.text} />;
    if (['XLS', 'XLSX', 'CSV'].includes(ext)) return <FileSpreadsheet size={22} className={badgeStyle.text} />;
    if (['JSON', 'TS', 'JS', 'HTML', 'PY'].includes(ext)) return <FileCode size={22} className={badgeStyle.text} />;
    return <FileText size={22} className={badgeStyle.text} />;
  };

  return (
    <div
      className={`rounded-xl p-3 border transition-all select-none ${
        isOwnMessage
          ? 'bg-white/10 border-white/20 text-white'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* File Type Icon Tile */}
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${badgeStyle.bg} ${badgeStyle.border}`}
        >
          {getIcon()}
        </div>

        {/* File Name, Size & Type Tag */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="font-semibold text-xs truncate leading-snug" title={attachment.name}>
            {attachment.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] opacity-75 font-mono">
            <span>{formatBytes(attachment.size)}</span>
            <span>•</span>
            <span className="uppercase font-bold tracking-wider">{ext}</span>
            {attachment.quality === 'original' && (
              <>
                <span>•</span>
                <span className="text-[10px] text-teal-400 font-semibold">Original</span>
              </>
            )}
          </div>
        </div>

        {/* Download / Action Button */}
        <div className="shrink-0">
          {failed ? (
            <button
              onClick={handleDownload}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              title="Download failed — Retry"
            >
              <RotateCcw size={15} />
            </button>
          ) : downloading ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center relative bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold">
              <span>{downloadProgress}%</span>
            </div>
          ) : isDownloaded ? (
            <button
              onClick={() => downloadFile(attachment.url, attachment.name)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              title="Open / Download again"
            >
              <ExternalLink size={15} />
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs ${
                isOwnMessage
                  ? 'bg-white text-[#16324F] hover:bg-slate-100'
                  : 'bg-[#16B8A6] text-white hover:bg-[#14a090]'
              }`}
              title="Download file"
            >
              <Download size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (Upload or Download) */}
      {downloading && (
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] mb-1 font-mono opacity-80">
            <span>Downloading...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full bg-slate-300 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#16B8A6] h-full transition-all duration-200 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {failed && (
        <p className="mt-1 text-[11px] text-rose-400 font-medium">Transfer failed — Click retry</p>
      )}
    </div>
  );
};
