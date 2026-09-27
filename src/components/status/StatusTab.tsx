import React, { useState } from 'react';
import { Plus, Clock, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { StatusItem, User } from '../../types';
import { storage } from '../../services/storage';
import { CreateStatusModal } from './CreateStatusModal';
import { StatusViewerModal } from './StatusViewerModal';

interface StatusTabProps {
  currentUser: User;
}

export const StatusTab: React.FC<StatusTabProps> = ({ currentUser }) => {
  const [statuses, setStatuses] = useState<StatusItem[]>(() => storage.getStatuses());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingStatuses, setViewingStatuses] = useState<StatusItem[] | null>(null);

  const refreshStatuses = () => {
    setStatuses(storage.getStatuses());
  };

  const ownStatuses = statuses.filter((s) => s.userId === currentUser.id);
  const contactStatuses = statuses.filter((s) => s.userId !== currentUser.id);

  // Group other users' statuses by user
  const groupedContacts = contactStatuses.reduce<Record<string, StatusItem[]>>((acc, status) => {
    if (!acc[status.userId]) acc[status.userId] = [];
    acc[status.userId].push(status);
    return acc;
  }, {});

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
              <Sparkles size={22} className="text-[#16B8A6]" />
              Status Updates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Temporary 24-hour photos, videos, and thoughts shared privately with contacts.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#16B8A6] hover:bg-[#14a090] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Status</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* My Status Card */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
            My Status
          </h3>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#16222F] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between hover:border-[#16B8A6]/40 transition-colors">
            <div
              onClick={() => {
                if (ownStatuses.length > 0) {
                  setViewingStatuses(ownStatuses);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
            >
              <div className="relative shrink-0">
                <div
                  className={`w-13 h-13 rounded-full p-0.5 ${
                    ownStatuses.length > 0
                      ? 'border-2 border-dashed border-[#16B8A6]'
                      : 'border-2 border-transparent'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {ownStatuses.length === 0 && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#16B8A6] text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#16222F]">
                    <Plus size={13} />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                  My Status
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {ownStatuses.length > 0
                    ? `${ownStatuses.length} active update${ownStatuses.length !== 1 ? 's' : ''} • Tap to view`
                    : 'Tap to add status update'}
                </p>
              </div>
            </div>

            {ownStatuses.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#16B8A6] hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                title="Add another status"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Recent Updates from Contacts */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
            Recent Updates
          </h3>

          {Object.keys(groupedContacts).length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#16222F] border border-slate-200/80 dark:border-slate-800/80 text-slate-400">
              <Clock size={32} className="mx-auto mb-2 opacity-50 text-[#16B8A6]" />
              <p className="text-xs font-medium">No recent status updates from contacts</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(groupedContacts).map(([userId, userStatuses]) => {
                const first = userStatuses[0];
                const hasUnviewed = userStatuses.some(
                  (s) => !s.viewers.some((v) => v.userId === currentUser.id)
                );

                return (
                  <div
                    key={userId}
                    onClick={() => setViewingStatuses(userStatuses)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#16222F] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-[#16B8A6]/40 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-13 h-13 rounded-full p-0.5 border-2 ${
                          hasUnviewed
                            ? 'border-[#16B8A6] ring-2 ring-[#16B8A6]/30'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <img
                          src={first.userAvatar}
                          alt={first.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                          {first.username}
                        </p>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatElapsed(first.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {userStatuses.length} update{userStatuses.length !== 1 ? 's' : ''} •{' '}
                        {first.type === 'text' ? first.content : 'Photo/Video status'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-2xl bg-[#16324F]/5 dark:bg-[#16324F]/20 border border-[#16324F]/10 dark:border-cyan-500/20 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck size={18} className="text-[#16B8A6] shrink-0 mt-0.5" />
          <p>
            Your status updates are end-to-end encrypted and visible only to people in your permitted contact audience. SYED has no public algorithm or discovery feed.
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateStatusModal
          onCreated={() => {
            setShowCreateModal(false);
            refreshStatuses();
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Viewer Modal */}
      {viewingStatuses && (
        <StatusViewerModal
          statuses={viewingStatuses}
          currentUser={currentUser}
          onClose={() => {
            setViewingStatuses(null);
            refreshStatuses();
          }}
          onDeleted={refreshStatuses}
        />
      )}
    </div>
  );
};
