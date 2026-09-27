import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  Phone,
  Video,
  ShieldAlert,
  Flag,
  UserCheck,
  Share2,
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../services/storage';

interface UserProfileModalProps {
  user: User;
  currentUser: User;
  onStartChat: (user: User) => void;
  onStartVoiceCall: (user: User) => void;
  onStartVideoCall: (user: User) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  currentUser,
  onStartChat,
  onStartVoiceCall,
  onStartVideoCall,
  onClose,
}) => {
  const [copiedUID, setCopiedUID] = useState(false);
  const [isBlocked, setIsBlocked] = useState(currentUser.blockedUsers.includes(user.id));
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('Spam or Unsolicited messages');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const handleCopyUID = () => {
    navigator.clipboard.writeText(user.uid.toString());
    setCopiedUID(true);
    setTimeout(() => setCopiedUID(false), 2000);
  };

  const handleToggleBlock = () => {
    const updatedBlocked = storage.toggleBlockUser(user.id);
    setIsBlocked(updatedBlocked);
  };

  const handleSubmitReport = () => {
    storage.reportEntity({
      reporterId: currentUser.id,
      targetId: user.id,
      targetType: 'user',
      reason: reportReason,
      details: reportDetails,
    });
    setReportSent(true);
    setTimeout(() => {
      setShowReport(false);
      setReportSent(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            User Profile
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-center">
          {/* Avatar with Online Badge */}
          <div className="relative inline-block mx-auto">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-md"
            />
            {user.online && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#16222F] rounded-full" />
            )}
          </div>

          {/* User Name & Permanent UID */}
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">{user.username}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                UID: {user.uid}
              </span>
              <button
                onClick={handleCopyUID}
                className="text-slate-400 hover:text-[#16B8A6] transition-colors p-0.5"
                title="Copy UID"
              >
                {copiedUID ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
            {copiedUID && (
              <p className="text-[10px] text-emerald-500 font-semibold mt-1 animate-in fade-in">
                UID copied to clipboard!
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Bio
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{user.bio}</p>
          </div>

          {/* Status info */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-500 dark:text-slate-400">
            <span>Presence Status</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {user.online ? 'Active Now' : user.lastSeen || 'Offline'}
            </span>
          </div>

          {/* Action Buttons: Message, Voice Call, Video Call (Strictly NO likes/social feeds!) */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={() => {
                onClose();
                onStartChat(user);
              }}
              className="py-2.5 px-2 rounded-2xl bg-[#16324F] hover:bg-[#112438] text-white flex flex-col items-center justify-center gap-1 transition-all shadow-xs"
            >
              <MessageSquare size={17} />
              <span className="text-[11px] font-bold">Message</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartVoiceCall(user);
              }}
              className="py-2.5 px-2 rounded-2xl bg-[#16B8A6] hover:bg-[#14a090] text-white flex flex-col items-center justify-center gap-1 transition-all shadow-xs"
            >
              <Phone size={17} />
              <span className="text-[11px] font-bold">Voice Call</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onStartVideoCall(user);
              }}
              className="py-2.5 px-2 rounded-2xl bg-[#16B8A6] hover:bg-[#14a090] text-white flex flex-col items-center justify-center gap-1 transition-all shadow-xs"
            >
              <Video size={17} />
              <span className="text-[11px] font-bold">Video Call</span>
            </button>
          </div>

          {/* Security & Moderation: Block / Report */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <button
              onClick={handleToggleBlock}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                isBlocked
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <ShieldAlert size={15} />
              <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
            </button>

            <button
              onClick={() => setShowReport(!showReport)}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Flag size={14} />
              <span>Report User</span>
            </button>
          </div>

          {/* Report Form */}
          {showReport && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-left space-y-2.5 animate-in fade-in">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Reason for Reporting:
              </p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border-none text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Spam or Unsolicited messages">Spam or Unsolicited messages</option>
                <option value="Harassment or Inappropriate behavior">
                  Harassment or Inappropriate behavior
                </option>
                <option value="Malicious links or files">Malicious links or files</option>
                <option value="Impersonation">Impersonation</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border-none text-xs text-slate-800 dark:text-slate-200 resize-none"
              />

              <button
                onClick={handleSubmitReport}
                disabled={reportSent}
                className="w-full py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
              >
                {reportSent ? 'Report Submitted' : 'Submit Confidential Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
