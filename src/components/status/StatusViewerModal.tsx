import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { StatusItem, User } from '../../types';
import { storage } from '../../services/storage';

interface StatusViewerModalProps {
  statuses: StatusItem[];
  initialIndex?: number;
  currentUser: User;
  onClose: () => void;
  onDeleted?: () => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  statuses,
  initialIndex = 0,
  currentUser,
  onClose,
  onDeleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersSheet, setShowViewersSheet] = useState(false);

  const currentStatus = statuses[currentIndex];
  const isOwn = currentStatus?.userId === currentUser.id;

  // Mark status as viewed
  useEffect(() => {
    if (currentStatus) {
      storage.viewStatus(currentStatus.id);
    }
  }, [currentIndex, currentStatus]);

  // Story progress timer
  useEffect(() => {
    if (isPaused || showViewersSheet || !currentStatus) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // ~5 seconds per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, showViewersSheet, currentStatus]);

  const handleNext = () => {
    setProgress(0);
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDelete = () => {
    if (!currentStatus) return;
    storage.deleteStatus(currentStatus.id);
    onDeleted?.();
    if (statuses.length <= 1) {
      onClose();
    } else {
      handleNext();
    }
  };

  if (!currentStatus) return null;

  const hoursRemaining = Math.max(1, Math.round((currentStatus.expiresAt - Date.now()) / (1000 * 60 * 60)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-md h-full sm:h-[90vh] bg-black sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Top Progress Segmented Bars */}
        <div className="p-3 z-30 flex items-center gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
          {statuses.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 rounded-full"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top User Bar */}
        <div className="px-4 py-2 flex items-center justify-between z-30 bg-gradient-to-b from-black/70 to-transparent text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStatus.userAvatar}
              alt={currentStatus.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#16B8A6]"
            />
            <div>
              <p className="text-sm font-bold leading-tight">{currentStatus.username}</p>
              <div className="flex items-center gap-1.5 text-[11px] opacity-75">
                <Clock size={11} />
                <span>Expires in {hoursRemaining}h</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwn && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-2 text-white/80 hover:text-rose-400 hover:bg-white/10 rounded-full transition-colors"
                title="Delete status"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Story Body */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {currentStatus.type === 'text' ? (
            <div
              className={`w-full h-full bg-gradient-to-br ${
                currentStatus.backgroundColor || 'from-[#16324F] to-[#101820]'
              } flex items-center justify-center p-8 text-center text-white`}
            >
              <p className="text-xl sm:text-2xl font-bold leading-relaxed max-w-sm">
                {currentStatus.content}
              </p>
            </div>
          ) : currentStatus.type === 'video' ? (
            <video
              src={currentStatus.content}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={currentStatus.content}
              alt="Status photo"
              className="w-full h-full object-contain"
            />
          )}

          {/* Caption banner if photo/video */}
          {currentStatus.caption && (
            <div className="absolute bottom-16 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center text-white text-sm font-medium">
              <p className="max-w-md mx-auto">{currentStatus.caption}</p>
            </div>
          )}

          {/* Left / Right Tap zones */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
        </div>

        {/* Bottom Bar: Viewers count for own status */}
        {isOwn && (
          <div className="p-3 z-30 bg-gradient-to-t from-black/90 to-transparent flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewersSheet(true);
              }}
              className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Eye size={15} />
              <span>
                {currentStatus.viewers.length} viewer{currentStatus.viewers.length !== 1 ? 's' : ''}
              </span>
            </button>
          </div>
        )}

        {/* Viewers Sheet Modal */}
        {showViewersSheet && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 z-40 max-h-[60%] bg-[#16222F] text-white rounded-t-3xl border-t border-slate-700 shadow-2xl flex flex-col p-4 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#16B8A6]" />
                <h4 className="text-sm font-bold">
                  Viewed by {currentStatus.viewers.length} contact{currentStatus.viewers.length !== 1 ? 's' : ''}
                </h4>
              </div>
              <button
                onClick={() => setShowViewersSheet(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-2">
              {currentStatus.viewers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No views yet</p>
              ) : (
                currentStatus.viewers.map((viewer) => (
                  <div
                    key={viewer.userId}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={viewer.avatar}
                        alt={viewer.username}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold">{viewer.username}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(viewer.viewedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Viewed</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
