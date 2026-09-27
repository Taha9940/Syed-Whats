import React, { useState } from 'react';
import { X, Users, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { User, Chat } from '../../types';
import { storage } from '../../services/storage';

interface CreateGroupModalProps {
  currentUser: User;
  onGroupCreated: (groupChat: Chat) => void;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  currentUser,
  onGroupCreated,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const contacts = storage.getAllUsers().filter((u) => u.id !== currentUser.id);

  const toggleSelect = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;
    const newGroup = storage.createGroup(
      groupName.trim(),
      groupDescription.trim(),
      selectedUserIds,
      avatarUrl.trim() || undefined
    );
    onGroupCreated(newGroup);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={19} className="text-[#16B8A6]" />
                {step === 1 ? 'Select Group Members' : 'Group Details'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 ? `${selectedUserIds.length} members selected` : 'Provide group identity'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Member Selection */}
        {step === 1 && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {contacts.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleSelect(user.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#16B8A6]/10 dark:bg-[#16B8A6]/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {user.username}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          UID: {user.uid} • {user.bio}
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

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={selectedUserIds.length === 0}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  selectedUserIds.length === 0
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#16B8A6] hover:bg-[#14a090] text-white shadow-md'
                }`}
              >
                <span>Next</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Group Metadata */}
        {step === 2 && (
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                Group Subject / Name *
              </label>
              <input
                type="text"
                placeholder="e.g., SYED Engineering Core"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                Group Description
              </label>
              <textarea
                placeholder="Describe the purpose of this group..."
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                Group Icon URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://... (or auto-generated)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16B8A6]"
              />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 -mx-5 -mb-5 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!groupName.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  !groupName.trim()
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-[#16B8A6] hover:bg-[#14a090] text-white shadow-md'
                }`}
              >
                <Check size={16} />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
