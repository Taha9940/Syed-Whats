export interface User {
  id: string;
  uid: number; // Permanent 9-digit numerical UID, e.g. 583927461
  username: string;
  email: string;
  avatar: string;
  bio: string;
  online: boolean;
  lastSeen?: string;
  blockedUsers: string[];
  privacySettings: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    statusAudience: 'all' | 'selected' | 'none';
    profileVisibility: 'all' | 'contacts';
  };
  notificationSettings: {
    messages: boolean;
    groups: boolean;
    calls: boolean;
    status: boolean;
    sound: boolean;
    vibration: boolean;
    messagePreview: boolean;
  };
  storageSettings: {
    autoDownloadMedia: boolean;
    compressionPreference: 'compressed' | 'original';
    maxFileSizeMB: number;
  };
  appearanceSettings: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
  };
}

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface FileAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: FileType;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for audio/video in seconds
  quality: 'compressed' | 'original';
  uploadProgress?: number; // 0 to 100
  uploadFailed?: boolean;
}

export interface VoiceNoteAttachment {
  id: string;
  url: string;
  duration: number; // in seconds
  waveformData: number[]; // normalized heights 0..100
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  attachments?: FileAttachment[];
  voiceNote?: VoiceNoteAttachment;
  timestamp: number;
  status: MessageStatus;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
    fileType?: string;
  };
  deletedFor?: string[];
  isDeletedForEveryone?: boolean;
  forwarded?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For groups
  avatar?: string;
  description?: string;
  participants: string[]; // User IDs
  adminIds?: string[]; // For groups
  onlyAdminsCanSend?: boolean;
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  isMuted?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StatusItem {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'text' | 'photo' | 'video';
  content: string; // text or media URL
  caption?: string;
  backgroundColor?: string;
  createdAt: number;
  expiresAt: number; // 24 hours from createdAt
  viewers: {
    userId: string;
    username: string;
    avatar: string;
    viewedAt: number;
  }[];
}

export interface CallSession {
  id: string;
  type: 'voice' | 'video';
  participant: User;
  isIncoming: boolean;
  status: 'calling' | 'ringing' | 'connected' | 'declined' | 'missed' | 'failed' | 'ended';
  duration: number; // elapsed seconds
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  cameraFacing: 'user' | 'environment';
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'message' | 'group';
  reason: string;
  details?: string;
  createdAt: number;
}
