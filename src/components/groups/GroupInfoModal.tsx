import React, { useState } from 'react';
import {
  X,
  Shield,
  UserPlus,
  LogOut,
  Edit2,
  Check,
  MoreVertical,
  ShieldAlert,
  Users,
  Lock,
} from 'lucide-react';
import { Chat, User } from '../../types';
import { storage } from '../../services/storage';

interface GroupInfoModalProps {
  groupChat: Chat;
  currentUser: User;
  onUpdate: () => void;
  onClose: () => void;
  onLeave: () => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  groupChat,
  currentUser,
  onUpdate,
  onClose,
  onLeave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(groupChat.name || '');
  const [description, setDescription] = useState(groupChat.description || '');
  const [showAddMember, setShowAddMember] = useState(false);

  const isAdmin = groupChat.adminIds?.includes(currentUser.id) || false;
  const allUsers = storage.getAllUsers();
  const members = groupChat.participants.map((id) => allUsers.find((u) => u.id === id)!).filter(Boolean);
  const nonMembers = allUsers.filter((u) => !groupChat.participants.includes(u.id));

  const handleSaveInfo = () => {
    if (!name.trim()) return;
    storage.updateGroup(groupChat.id, {
      name: name.trim(),
      description: description.trim(),
    });
    setIsEditing(false);
    onUpdate();
  };

  const handleToggleAdminOnly = () => {
    if (!isAdmin) return;
    storage.updateGroup(groupChat.id, {
      onlyAdminsCanSend: !groupChat.onlyAdminsCanSend,
    });
    onUpdate();
  };

  const handlePromoteAdmin = (userId: string) => {
    if (!isAdmin) return;
    const currentAdmins = groupChat.adminIds || [];
    const newAdmins = currentAdmins.includes(userId)
      ? currentAdmins.filter((id) => id !== userId)
      : [...currentAdmins, userId];

    storage.updateGroup(groupChat.id, { adminIds: newAdmins });
    onUpdate();
  };

  const handleRemoveMember = (userId: string) => {
    if (!isAdmin) return;
    const newParticipants = groupChat.participants.filter((id) => id !== userId);
    const newAdmins = groupChat.adminIds?.filter((id) => id !== userId) || [];
    storage.updateGroup(groupChat.id, {
      participants: newParticipants,
      adminIds: newAdmins,
    });
    onUpdate();
  };

  const handleAddMember = (userId: string) => {
    if (!groupChat.participants.includes(userId)) {
      const newParticipants = [...groupChat.participants, userId];
      storage.updateGroup(groupChat.id, { participants: newParticipants });
      onUpdate();
      setShowAddMember(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#16222F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Group Profile</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar and Info Card */}
          <div className="flex flex-col items-center text-center">
            <img
              src={groupChat.avatar || 'https://api.dicebear.com/7.x/shapes/svg?seed=group'}
              alt={groupChat.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-md mb-3"
            />

            {isEditing ? (
              <div className="w-full space-y-2 mt-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold text-center text-slate-800 dark:text-white focus:ring-2 focus:ring-[#16B8A6]"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-[#16B8A6] resize-none"
                />
                <button
                  onClick={handleSaveInfo}
                  className="px-4 py-1.5 rounded-xl bg-[#16B8A6] text-white text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">
                    {groupChat.name}
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-slate-400 hover:text-[#16B8A6]"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {groupChat.description || 'No description provided.'}
                </p>
                <p className="text-[11px] font-semibold text-[#16B8A6] mt-1 font-mono">
                  {members.length} Members
                </p>
              </div>
            )}
          </div>

          {/* Group Permissions (Admin only) */}
          {isAdmin && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock size={17} className="text-[#16B8A6]" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Admin Only Messages
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Only group admins can post in this chat
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAdminOnly}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  groupChat.onlyAdminsCanSend ? 'bg-[#16B8A6]' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    groupChat.onlyAdminsCanSend ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Members ({members.length})
              </h4>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-xs font-bold text-[#16B8A6] hover:underline flex items-center gap-1"
                >
                  <UserPlus size={14} />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            {/* Add Member Dropdown */}
            {showAddMember && (
              <div className="mb-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Select Contact to Add:
                </p>
                {nonMembers.length === 0 ? (
                  <p className="text-xs text-slate-400">All available contacts are already in this group.</p>
                ) : (
                  nonMembers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 cursor-pointer hover:border-[#16B8A6] border border-transparent transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {user.username}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#16B8A6] font-bold">+ Add</span>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="space-y-1.5">
              {members.map((member) => {
                const memberIsAdmin = groupChat.adminIds?.includes(member.id);
                const isSelf = member.id === currentUser.id;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {member.username} {isSelf && '(You)'}
                          </p>
                          {memberIsAdmin && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#16B8A6]/20 text-[#16B8A6] text-[9px] font-bold tracking-wider uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          UID: {member.uid}
                        </p>
                      </div>
                    </div>

                    {isAdmin && !isSelf && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePromoteAdmin(member.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            memberIsAdmin
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-[#16B8A6]/10 text-[#16B8A6] hover:bg-[#16B8A6]/20'
                          }`}
                        >
                          {memberIsAdmin ? 'Dismiss Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove from group"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: Leave Group */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
          >
            Close
          </button>
          <button
            onClick={onLeave}
            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={15} />
            <span>Leave Group</span>
          </button>
        </div>
      </div>
    </div>
  );
};
