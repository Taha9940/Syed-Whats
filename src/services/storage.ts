import { User, Chat, Message, StatusItem, FileAttachment, VoiceNoteAttachment, ReportItem } from '../types';
import { supabaseService } from './supabaseService';
import { isSupabaseConfigured, SUPABASE_PROJECT_URL } from './supabase';

const STORAGE_KEYS = {
  CURRENT_USER: 'syed_current_user',
  USERS: 'syed_all_users',
  CHATS: 'syed_chats',
  MESSAGES: 'syed_messages',
  STATUSES: 'syed_statuses',
  REPORTS: 'syed_reports',
};

// Initial Seed Users
const DEFAULT_USERS: User[] = [
  {
    id: 'user_syed',
    uid: 583927461,
    username: 'Syed',
    email: 'syed@syedapp.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Graphic Designer | Presentation Designer & UI Architect',
    online: true,
    lastSeen: 'Online',
    blockedUsers: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      statusAudience: 'all',
      profileVisibility: 'all',
    },
    notificationSettings: {
      messages: true,
      groups: true,
      calls: true,
      status: true,
      sound: true,
      vibration: true,
      messagePreview: true,
    },
    storageSettings: {
      autoDownloadMedia: true,
      compressionPreference: 'compressed',
      maxFileSizeMB: 500,
    },
    appearanceSettings: {
      theme: 'system',
      accentColor: '#16B8A6',
    },
  },
  {
    id: 'user_rehan',
    uid: 492018374,
    username: 'Rehan',
    email: 'rehan@cloudcorp.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Full Stack Engineer & Cloud Architect. Building secure distributed systems.',
    online: true,
    lastSeen: 'Online',
    blockedUsers: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      statusAudience: 'all',
      profileVisibility: 'all',
    },
    notificationSettings: {
      messages: true,
      groups: true,
      calls: true,
      status: true,
      sound: true,
      vibration: true,
      messagePreview: true,
    },
    storageSettings: {
      autoDownloadMedia: true,
      compressionPreference: 'compressed',
      maxFileSizeMB: 500,
    },
    appearanceSettings: {
      theme: 'system',
      accentColor: '#16B8A6',
    },
  },
  {
    id: 'user_taha',
    uid: 739104825,
    username: 'SyedTaha',
    email: 'syedtaha3578@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'Mobile App Developer & Security Enthusiast. SYED Project Lead.',
    online: true,
    lastSeen: 'Online',
    blockedUsers: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      statusAudience: 'all',
      profileVisibility: 'all',
    },
    notificationSettings: {
      messages: true,
      groups: true,
      calls: true,
      status: true,
      sound: true,
      vibration: true,
      messagePreview: true,
    },
    storageSettings: {
      autoDownloadMedia: true,
      compressionPreference: 'compressed',
      maxFileSizeMB: 500,
    },
    appearanceSettings: {
      theme: 'system',
      accentColor: '#16B8A6',
    },
  },
  {
    id: 'user_ahmed',
    uid: 918237465,
    username: 'Ahmed',
    email: 'ahmed.pm@techmail.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    bio: 'Product Manager | Crafting intuitive user interfaces and workflows.',
    online: false,
    lastSeen: 'Today at 7:15 PM',
    blockedUsers: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      statusAudience: 'all',
      profileVisibility: 'all',
    },
    notificationSettings: {
      messages: true,
      groups: true,
      calls: true,
      status: true,
      sound: true,
      vibration: true,
      messagePreview: true,
    },
    storageSettings: {
      autoDownloadMedia: true,
      compressionPreference: 'compressed',
      maxFileSizeMB: 500,
    },
    appearanceSettings: {
      theme: 'system',
      accentColor: '#16B8A6',
    },
  },
  {
    id: 'user_ali',
    uid: 615284930,
    username: 'Ali_786',
    email: 'ali786@globalnet.org',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    bio: 'Data Analyst & Tech Explorer. Fast reliable communication.',
    online: false,
    lastSeen: 'Yesterday at 10:45 PM',
    blockedUsers: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      statusAudience: 'all',
      profileVisibility: 'all',
    },
    notificationSettings: {
      messages: true,
      groups: true,
      calls: true,
      status: true,
      sound: true,
      vibration: true,
      messagePreview: true,
    },
    storageSettings: {
      autoDownloadMedia: true,
      compressionPreference: 'compressed',
      maxFileSizeMB: 500,
    },
    appearanceSettings: {
      theme: 'system',
      accentColor: '#16B8A6',
    },
  },
  {
    id: 'user_sarah',
    uid: 382910475,
    username: 'Sarah_K',
    email: 'sarah.k@designstudio.art',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bio: 'Creative Director & 3D Vector Specialist.',
    online: true,
    lastSeen: 'Online',
    blockedUsers: [],
    privacySettings: {
      showOnlineStatus: true,
      showLastSeen: true,
      statusAudience: 'all',
      profileVisibility: 'all',
    },
    notificationSettings: {
      messages: true,
      groups: true,
      calls: true,
      status: true,
      sound: true,
      vibration: true,
      messagePreview: true,
    },
    storageSettings: {
      autoDownloadMedia: true,
      compressionPreference: 'compressed',
      maxFileSizeMB: 500,
    },
    appearanceSettings: {
      theme: 'system',
      accentColor: '#16B8A6',
    },
  },
];

// Initial Seed Chats
const DEFAULT_CHATS: Chat[] = [
  {
    id: 'chat_direct_rehan',
    type: 'direct',
    participants: ['user_syed', 'user_rehan'],
    unreadCount: { user_syed: 0, user_rehan: 0 },
    pinned: true,
    createdAt: Date.now() - 3600 * 48 * 1000,
    updatedAt: Date.now() - 1000 * 60 * 12,
  },
  {
    id: 'chat_direct_taha',
    type: 'direct',
    participants: ['user_syed', 'user_taha'],
    unreadCount: { user_syed: 1, user_taha: 0 },
    pinned: true,
    createdAt: Date.now() - 3600 * 24 * 1000,
    updatedAt: Date.now() - 1000 * 60 * 3,
  },
  {
    id: 'chat_group_core',
    type: 'group',
    name: 'SYED Core Team',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
    description: 'Official development, architecture, and design team for the SYED private communication platform.',
    participants: ['user_syed', 'user_rehan', 'user_taha', 'user_ahmed', 'user_sarah'],
    adminIds: ['user_syed', 'user_taha'],
    onlyAdminsCanSend: false,
    unreadCount: { user_syed: 0 },
    pinned: false,
    createdAt: Date.now() - 3600 * 72 * 1000,
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
  {
    id: 'chat_direct_ahmed',
    type: 'direct',
    participants: ['user_syed', 'user_ahmed'],
    unreadCount: { user_syed: 0, user_ahmed: 0 },
    createdAt: Date.now() - 3600 * 36 * 1000,
    updatedAt: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'chat_group_design',
    type: 'group',
    name: 'Design & Assets Studio',
    avatar: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=200&auto=format&fit=crop&q=80',
    description: 'Creative discussions, presentation decks, icon sets, and vector assets sharing.',
    participants: ['user_syed', 'user_sarah', 'user_rehan'],
    adminIds: ['user_syed'],
    onlyAdminsCanSend: false,
    unreadCount: { user_syed: 0 },
    createdAt: Date.now() - 3600 * 90 * 1000,
    updatedAt: Date.now() - 1000 * 60 * 360,
  },
];

// Initial Seed Messages
const DEFAULT_MESSAGES: Message[] = [
  // Rehan Chat
  {
    id: 'msg_r_1',
    chatId: 'chat_direct_rehan',
    senderId: 'user_rehan',
    senderName: 'Rehan',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    text: 'Salam Syed! Have you reviewed the new multi-file chunking specs for the media engine?',
    timestamp: Date.now() - 1000 * 60 * 35,
    status: 'read',
  },
  {
    id: 'msg_r_2',
    chatId: 'chat_direct_rehan',
    senderId: 'user_syed',
    senderName: 'Syed',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    text: 'Yes Rehan, tested it thoroughly. Here are the updated system diagrams and archive files you requested.',
    attachments: [
      {
        id: 'att_doc_1',
        name: 'SYED_Architecture_v2.4.pdf',
        size: 3450000,
        type: 'document',
        mimeType: 'application/pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        quality: 'original',
        uploadProgress: 100,
      },
      {
        id: 'att_zip_1',
        name: 'syed_brand_assets_and_icons.zip',
        size: 14800000,
        type: 'archive',
        mimeType: 'application/zip',
        url: '#',
        quality: 'original',
        uploadProgress: 100,
      },
    ],
    timestamp: Date.now() - 1000 * 60 * 20,
    status: 'read',
  },
  {
    id: 'msg_r_3',
    chatId: 'chat_direct_rehan',
    senderId: 'user_rehan',
    senderName: 'Rehan',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    text: 'This is brilliant! The PDF breakdown is crystal clear. I left a quick audio update regarding the WebRTC STUN relay configuration:',
    voiceNote: {
      id: 'vn_r_1',
      url: 'https://actions.google.com/sounds/v1/water/stream_water.ogg',
      duration: 18,
      waveformData: [20, 35, 60, 80, 45, 90, 70, 40, 25, 65, 85, 95, 60, 40, 30, 70, 50, 20],
    },
    timestamp: Date.now() - 1000 * 60 * 12,
    status: 'read',
  },

  // SyedTaha Chat
  {
    id: 'msg_t_1',
    chatId: 'chat_direct_taha',
    senderId: 'user_syed',
    senderName: 'Syed',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    text: 'Taha, the numerical UID search algorithm is lightning fast now! Users can discover each other seamlessly with either 9-digit UID or username.',
    timestamp: Date.now() - 1000 * 60 * 15,
    status: 'read',
  },
  {
    id: 'msg_t_2',
    chatId: 'chat_direct_taha',
    senderId: 'user_taha',
    senderName: 'SyedTaha',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    text: 'Great work Syed! And best of all, absolutely zero social media clutter — strictly private, encrypted, and direct communication. Check this UI preview:',
    attachments: [
      {
        id: 'att_img_1',
        name: 'syed_preview_interface.png',
        size: 1820000,
        type: 'image',
        mimeType: 'image/png',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
        quality: 'compressed',
        uploadProgress: 100,
      }
    ],
    timestamp: Date.now() - 1000 * 60 * 3,
    status: 'delivered',
  },

  // Group Core Messages
  {
    id: 'msg_gc_1',
    chatId: 'chat_group_core',
    senderId: 'user_taha',
    senderName: 'SyedTaha',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    text: 'Welcome team to the SYED secure communication workspace. Reminder: All file sharing is fully supported: Images, Videos, Audio, Documents, and Archives up to 500 MB.',
    timestamp: Date.now() - 1000 * 60 * 90,
    status: 'read',
  },
  {
    id: 'msg_gc_2',
    chatId: 'chat_group_core',
    senderId: 'user_sarah',
    senderName: 'Sarah_K',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    text: 'The brand color scheme (#16324F Primary Navy, #16B8A6 Accent Teal, #F7F9FC Light, #101820 Dark) looks exceptionally sharp and executive.',
    timestamp: Date.now() - 1000 * 60 * 45,
    status: 'read',
  },
];

// Initial Seed Statuses (24 hour expiration)
const DEFAULT_STATUSES: StatusItem[] = [
  {
    id: 'st_syed_1',
    userId: 'user_syed',
    username: 'Syed',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    type: 'text',
    content: '⚡ High performance file transfers and end-to-end private voice channels ready on SYED!',
    backgroundColor: 'from-[#16324F] to-[#0F172A]',
    createdAt: Date.now() - 1000 * 60 * 90,
    expiresAt: Date.now() + 1000 * 60 * 60 * 22,
    viewers: [
      {
        userId: 'user_rehan',
        username: 'Rehan',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        viewedAt: Date.now() - 1000 * 60 * 40,
      },
      {
        userId: 'user_taha',
        username: 'SyedTaha',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        viewedAt: Date.now() - 1000 * 60 * 20,
      },
      {
        userId: 'user_sarah',
        username: 'Sarah_K',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        viewedAt: Date.now() - 1000 * 60 * 15,
      }
    ],
  },
  {
    id: 'st_taha_1',
    userId: 'user_taha',
    username: 'SyedTaha',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    type: 'photo',
    content: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    caption: 'Testing WebRTC calling peer-to-peer latency. Under 40ms worldwide.',
    createdAt: Date.now() - 1000 * 60 * 180,
    expiresAt: Date.now() + 1000 * 60 * 60 * 20,
    viewers: [
      {
        userId: 'user_syed',
        username: 'Syed',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        viewedAt: Date.now() - 1000 * 60 * 60,
      }
    ],
  },
  {
    id: 'st_rehan_1',
    userId: 'user_rehan',
    username: 'Rehan',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    type: 'text',
    content: '🚀 No phone numbers, no tracking, just pure secure communication by username & numerical UID.',
    backgroundColor: 'from-[#16B8A6] to-[#0D9488]',
    createdAt: Date.now() - 1000 * 60 * 240,
    expiresAt: Date.now() + 1000 * 60 * 60 * 19,
    viewers: [],
  },
  {
    id: 'st_sarah_1',
    userId: 'user_sarah',
    username: 'Sarah_K',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    type: 'photo',
    content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    caption: 'Origami paper plane design system complete ✈️',
    createdAt: Date.now() - 1000 * 60 * 300,
    expiresAt: Date.now() + 1000 * 60 * 60 * 18,
    viewers: [],
  }
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set failed', e);
    }
  }

  // --- Auth & Users ---
  getCurrentUser(): User {
    const user = this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (!user) {
      this.set(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
      return DEFAULT_USERS[0];
    }
    return user;
  }

  setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    // Also sync to all users
    const all = this.getAllUsers();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      all[idx] = user;
    } else {
      all.push(user);
    }
    this.set(STORAGE_KEYS.USERS, all);

    // Sync to Supabase profiles
    if (isSupabaseConfigured()) {
      supabaseService.updateProfile(user);
    }
  }

  getSupabaseStatus() {
    return {
      configured: isSupabaseConfigured(),
      projectUrl: SUPABASE_PROJECT_URL,
    };
  }

  getAllUsers(): User[] {
    const users = this.get<User[] | null>(STORAGE_KEYS.USERS, null);
    if (!users || users.length === 0) {
      this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return users;
  }

  getUserById(id: string): User | undefined {
    return this.getAllUsers().find((u) => u.id === id);
  }

  // Generate unique 9-digit permanent numerical UID
  generateUniqueUID(): number {
    const users = this.getAllUsers();
    let uid = 0;
    let isUnique = false;
    while (!isUnique) {
      // 9 digits between 100000000 and 999999999
      uid = Math.floor(100000000 + Math.random() * 900000000);
      if (!users.some((u) => u.uid === uid)) {
        isUnique = true;
      }
    }
    return uid;
  }

  // Check username uniqueness
  checkUsernameUnique(username: string, excludeUserId?: string): { isUnique: boolean; suggestions: string[] } {
    const clean = username.trim().toLowerCase();
    const users = this.getAllUsers();
    const existing = users.find(
      (u) => u.username.toLowerCase() === clean && u.id !== excludeUserId
    );

    if (!existing) {
      return { isUnique: true, suggestions: [] };
    }

    // Generate intelligent alternatives
    const rand1 = Math.floor(10 + Math.random() * 90);
    const rand2 = Math.floor(100 + Math.random() * 900);
    const suggestions = [
      `${username}_${rand1}`,
      `${username}${rand2}`,
      `Real_${username}`,
      `${username}_Official`,
    ];

    return { isUnique: false, suggestions };
  }

  async registerUser(params: { email: string; password: string; username: string; bio?: string }): Promise<{ success: boolean; error?: string; user?: User; suggestions?: string[] }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const users = this.getAllUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const { isUnique, suggestions } = this.checkUsernameUnique(params.username);
    if (!isUnique) {
      return {
        success: false,
        error: `Username "${params.username}" is already taken.`,
        suggestions,
      };
    }

    const newUID = this.generateUniqueUID();

    if (isSupabaseConfigured()) {
      const supaResult = await supabaseService.signUp({
        email: cleanEmail,
        password: params.password,
        username: params.username,
        uid: newUID,
        bio: params.bio,
      });

      if (!supaResult.success) {
        return { success: false, error: supaResult.error };
      }

      if (supaResult.user) {
        users.push(supaResult.user);
        this.set(STORAGE_KEYS.USERS, users);
        this.setCurrentUser(supaResult.user);
        return { success: true, user: supaResult.user };
      }
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      uid: newUID,
      username: params.username.trim(),
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${params.username}`,
      bio: params.bio?.trim() || 'Hey there! I am using SYED.',
      online: true,
      lastSeen: 'Online',
      blockedUsers: [],
      privacySettings: {
        showOnlineStatus: true,
        showLastSeen: true,
        statusAudience: 'all',
        profileVisibility: 'all',
      },
      notificationSettings: {
        messages: true,
        groups: true,
        calls: true,
        status: true,
        sound: true,
        vibration: true,
        messagePreview: true,
      },
      storageSettings: {
        autoDownloadMedia: true,
        compressionPreference: 'compressed',
        maxFileSizeMB: 500,
      },
      appearanceSettings: {
        theme: 'system',
        accentColor: '#16B8A6',
      },
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  }

  async loginUser(email: string, password?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && password) {
      const supaResult = await supabaseService.signIn(cleanEmail, password);
      if (supaResult.success && supaResult.user) {
        this.setCurrentUser(supaResult.user);
        return { success: true, user: supaResult.user };
      } else if (supaResult.error && !supaResult.error.toLowerCase().includes('failed to fetch')) {
        return { success: false, error: supaResult.error };
      }
    }

    const users = this.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    user.online = true;
    user.lastSeen = 'Online';
    this.setCurrentUser(user);
    return { success: true, user };
  }

  searchUsers(query: string, currentUserId: string): User[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const users = this.getAllUsers();
    return users.filter((u) => {
      if (u.id === currentUserId) return false;
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchUID = u.uid.toString().includes(q);
      return matchUsername || matchUID;
    });
  }

  // --- Chats & Messaging ---
  getChats(): Chat[] {
    const chats = this.get<Chat[] | null>(STORAGE_KEYS.CHATS, null);
    if (!chats) {
      this.set(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
      return DEFAULT_CHATS;
    }
    return chats;
  }

  getMessages(chatId: string): Message[] {
    const all = this.get<Message[] | null>(STORAGE_KEYS.MESSAGES, null);
    const msgs = all || DEFAULT_MESSAGES;
    if (!all) {
      this.set(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    }
    return msgs.filter((m) => m.chatId === chatId && !m.deletedFor?.includes(this.getCurrentUser().id));
  }

  getOrCreateDirectChat(otherUserId: string): Chat {
    const currentUser = this.getCurrentUser();
    const chats = this.getChats();

    const existing = chats.find(
      (c) =>
        c.type === 'direct' &&
        c.participants.includes(currentUser.id) &&
        c.participants.includes(otherUserId)
    );

    if (existing) return existing;

    const newChat: Chat = {
      id: `chat_direct_${Date.now()}`,
      type: 'direct',
      participants: [currentUser.id, otherUserId],
      unreadCount: { [currentUser.id]: 0, [otherUserId]: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    chats.unshift(newChat);
    this.set(STORAGE_KEYS.CHATS, chats);

    // Sync to Supabase conversations and conversation_members
    if (isSupabaseConfigured()) {
      supabaseService.getOrCreateDirectConversation(currentUser.id, otherUserId).then((supaId) => {
        if (supaId && supaId !== newChat.id) {
          const currentChats = this.getChats();
          const target = currentChats.find((c) => c.id === newChat.id);
          if (target) {
            target.id = supaId;
            this.set(STORAGE_KEYS.CHATS, currentChats);
          }
        }
      }).catch((e) => console.warn('Supabase direct conversation sync notice:', e));
    }

    return newChat;
  }

  async syncMessagesFromSupabase(chatId: string): Promise<Message[]> {
    if (!isSupabaseConfigured()) {
      return this.getMessages(chatId);
    }

    try {
      const supaMsgs = await supabaseService.fetchMessages(chatId);
      if (supaMsgs && supaMsgs.length > 0) {
        const all = this.get<Message[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
        const map = new Map<string, Message>();
        for (const m of all) {
          map.set(m.id, m);
        }
        for (const sm of supaMsgs) {
          map.set(sm.id, sm);
        }
        const merged = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
        this.set(STORAGE_KEYS.MESSAGES, merged);

        // Update lastMessage on chat
        const chats = this.getChats();
        const chatIdx = chats.findIndex((c) => c.id === chatId);
        if (chatIdx >= 0) {
          const latest = merged.filter((m) => m.chatId === chatId).pop();
          if (latest) {
            chats[chatIdx].lastMessage = latest;
            chats[chatIdx].updatedAt = Math.max(chats[chatIdx].updatedAt, latest.timestamp);
            this.set(STORAGE_KEYS.CHATS, chats);
          }
        }

        return merged.filter((m) => m.chatId === chatId && !m.deletedFor?.includes(this.getCurrentUser().id));
      }
    } catch (err) {
      console.warn('Sync messages from Supabase notice:', err);
    }

    return this.getMessages(chatId);
  }

  async syncConversationsFromSupabase(): Promise<Chat[]> {
    if (!isSupabaseConfigured()) {
      return this.getChats();
    }

    try {
      const currentUser = this.getCurrentUser();
      const supaChats = await supabaseService.fetchConversations(currentUser.id);
      if (supaChats && supaChats.length > 0) {
        const localChats = this.getChats();
        const map = new Map<string, Chat>();
        for (const lc of localChats) {
          map.set(lc.id, lc);
        }
        for (const sc of supaChats) {
          const existing = map.get(sc.id);
          if (existing) {
            map.set(sc.id, { ...existing, ...sc, updatedAt: Math.max(existing.updatedAt, sc.updatedAt) });
          } else {
            map.set(sc.id, sc);
          }
        }
        const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
        this.set(STORAGE_KEYS.CHATS, merged);
        window.dispatchEvent(new CustomEvent('syed:new_message'));
        return merged;
      }
    } catch (err) {
      console.warn('Sync conversations from Supabase notice:', err);
    }

    return this.getChats();
  }

  addReceivedMessage(newMsg: Message): void {
    const all = this.get<Message[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    const existingIdx = all.findIndex((m) => m.id === newMsg.id);

    if (existingIdx >= 0) {
      all[existingIdx] = { ...all[existingIdx], ...newMsg };
    } else {
      all.push(newMsg);
    }
    all.sort((a, b) => a.timestamp - b.timestamp);
    this.set(STORAGE_KEYS.MESSAGES, all);

    // Update chat last message & updatedAt
    const chats = this.getChats();
    const chatIdx = chats.findIndex((c) => c.id === newMsg.chatId);
    if (chatIdx >= 0) {
      chats[chatIdx].lastMessage = newMsg;
      chats[chatIdx].updatedAt = Math.max(chats[chatIdx].updatedAt, newMsg.timestamp);
      this.set(STORAGE_KEYS.CHATS, chats);
    }

    window.dispatchEvent(new CustomEvent('syed:new_message', { detail: { chatId: newMsg.chatId, message: newMsg } }));
  }

  sendMessage(
    chatId: string,
    text: string,
    attachments?: FileAttachment[],
    voiceNote?: VoiceNoteAttachment,
    replyTo?: Message['replyTo']
  ): Message {
    const currentUser = this.getCurrentUser();
    const allMessages = this.get<Message[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      attachments,
      voiceNote,
      replyTo,
      timestamp: Date.now(),
      status: 'sending',
    };

    allMessages.push(newMsg);
    this.set(STORAGE_KEYS.MESSAGES, allMessages);

    // Sync message to Supabase
    if (isSupabaseConfigured()) {
      supabaseService.saveMessage(newMsg).catch((e) => console.warn('Supabase message sync notice:', e));
    }

    // Update Chat updatedAt & lastMessage
    const chats = this.getChats();
    const chatIndex = chats.findIndex((c) => c.id === chatId);
    if (chatIndex >= 0) {
      chats[chatIndex].updatedAt = Date.now();
      chats[chatIndex].lastMessage = newMsg;
      this.set(STORAGE_KEYS.CHATS, chats);

      if (isSupabaseConfigured()) {
        supabaseService.saveConversation(chats[chatIndex]).catch((e) => console.warn('Supabase conversation sync notice:', e));
      }
    }

    // Progression of message status: sending -> sent -> delivered -> read
    setTimeout(() => {
      this.updateMessageStatus(newMsg.id, 'sent');
    }, 400);

    setTimeout(() => {
      this.updateMessageStatus(newMsg.id, 'delivered');
    }, 1200);

    setTimeout(() => {
      this.updateMessageStatus(newMsg.id, 'read');
    }, 2200);

    // Realistic auto-reply simulation for demo contacts
    this.handleAutoResponse(chatId, newMsg);

    return newMsg;
  }

  updateMessageStatus(messageId: string, status: Message['status']): void {
    const all = this.get<Message[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    const msg = all.find((m) => m.id === messageId);
    if (msg) {
      msg.status = status;
      this.set(STORAGE_KEYS.MESSAGES, all);
    }
  }

  deleteMessage(messageId: string, forEveryone = false): void {
    const currentUserId = this.getCurrentUser().id;
    const all = this.get<Message[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
    const msg = all.find((m) => m.id === messageId);

    if (!msg) return;

    if (forEveryone && msg.senderId === currentUserId) {
      msg.isDeletedForEveryone = true;
      msg.text = 'This message was deleted';
      msg.attachments = undefined;
      msg.voiceNote = undefined;
    } else {
      msg.deletedFor = msg.deletedFor || [];
      if (!msg.deletedFor.includes(currentUserId)) {
        msg.deletedFor.push(currentUserId);
      }
    }

    this.set(STORAGE_KEYS.MESSAGES, all);
  }

  createGroup(name: string, description: string, participantIds: string[], avatar?: string): Chat {
    const currentUser = this.getCurrentUser();
    const chats = this.getChats();

    const newGroup: Chat = {
      id: `chat_group_${Date.now()}`,
      type: 'group',
      name: name.trim(),
      description: description.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
      participants: Array.from(new Set([currentUser.id, ...participantIds])),
      adminIds: [currentUser.id],
      onlyAdminsCanSend: false,
      unreadCount: { [currentUser.id]: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    chats.unshift(newGroup);
    this.set(STORAGE_KEYS.CHATS, chats);

    if (isSupabaseConfigured()) {
      supabaseService.saveConversation(newGroup).catch((e) => console.warn('Supabase group sync notice:', e));
    }

    // Initial system announcement
    this.sendMessage(newGroup.id, `Created group "${newGroup.name}". Welcome all members!`);

    return newGroup;
  }

  updateGroup(chatId: string, updates: Partial<Chat>): void {
    const chats = this.getChats();
    const idx = chats.findIndex((c) => c.id === chatId);
    if (idx >= 0) {
      chats[idx] = { ...chats[idx], ...updates, updatedAt: Date.now() };
      this.set(STORAGE_KEYS.CHATS, chats);

      if (isSupabaseConfigured()) {
        supabaseService.saveConversation(chats[idx]).catch((e) => console.warn('Supabase group update sync notice:', e));
      }
    }
  }

  // --- Statuses (Temporary 24-hour updates) ---
  getStatuses(): StatusItem[] {
    const all = this.get<StatusItem[] | null>(STORAGE_KEYS.STATUSES, null);
    const statuses = all || DEFAULT_STATUSES;
    if (!all) {
      this.set(STORAGE_KEYS.STATUSES, DEFAULT_STATUSES);
    }
    // Filter out expired (> 24 hours)
    const now = Date.now();
    return statuses.filter((s) => s.expiresAt > now);
  }

  createStatus(params: {
    type: 'text' | 'photo' | 'video';
    content: string;
    caption?: string;
    backgroundColor?: string;
  }): StatusItem {
    const currentUser = this.getCurrentUser();
    const all = this.getStatuses();

    const newStatus: StatusItem = {
      id: `st_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      type: params.type,
      content: params.content,
      caption: params.caption,
      backgroundColor: params.backgroundColor || 'from-[#16324F] to-[#101820]',
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      viewers: [],
    };

    all.unshift(newStatus);
    this.set(STORAGE_KEYS.STATUSES, all);

    if (isSupabaseConfigured()) {
      supabaseService.saveStatus(newStatus).catch((e) => console.warn('Supabase status sync notice:', e));
    }

    return newStatus;
  }

  viewStatus(statusId: string): void {
    const currentUser = this.getCurrentUser();
    const all = this.getStatuses();
    const status = all.find((s) => s.id === statusId);

    if (status && status.userId !== currentUser.id) {
      if (!status.viewers.some((v) => v.userId === currentUser.id)) {
        status.viewers.push({
          userId: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          viewedAt: Date.now(),
        });
        this.set(STORAGE_KEYS.STATUSES, all);
      }
    }
  }

  deleteStatus(statusId: string): void {
    const all = this.getStatuses();
    const filtered = all.filter((s) => s.id !== statusId);
    this.set(STORAGE_KEYS.STATUSES, filtered);
  }

  // --- Block & Report ---
  toggleBlockUser(targetUserId: string): boolean {
    const currentUser = this.getCurrentUser();
    const isBlocked = currentUser.blockedUsers.includes(targetUserId);

    if (isBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter((id) => id !== targetUserId);
    } else {
      currentUser.blockedUsers.push(targetUserId);
    }

    this.setCurrentUser(currentUser);
    return !isBlocked;
  }

  reportEntity(report: Omit<ReportItem, 'id' | 'createdAt'>): void {
    const reports = this.get<ReportItem[]>(STORAGE_KEYS.REPORTS, []);
    reports.push({
      ...report,
      id: `rep_${Date.now()}`,
      createdAt: Date.now(),
    });
    this.set(STORAGE_KEYS.REPORTS, reports);
  }

  // Auto response logic for interactive chat feel
  private handleAutoResponse(chatId: string, userMsg: Message): void {
    const chat = this.getChats().find((c) => c.id === chatId);
    if (!chat || chat.type !== 'direct') return;

    const otherUserId = chat.participants.find((p) => p !== userMsg.senderId);
    if (!otherUserId) return;

    const otherUser = this.getUserById(otherUserId);
    if (!otherUser || !otherUser.online) return;

    // Check if blocked
    const currentUser = this.getCurrentUser();
    if (currentUser.blockedUsers.includes(otherUserId) || otherUser.blockedUsers.includes(currentUser.id)) {
      return;
    }

    const responses: Record<string, string[]> = {
      user_rehan: [
        'Got the files! Processing and verifying checksums right now.',
        'The transfer speed on SYED is remarkably fast. Thanks for sending!',
        'Sounds good Syed, I will incorporate these specs directly into the architecture.',
        'Noted! Let me check the documentation and get back to you shortly.',
      ],
      user_taha: [
        'Message received loud and clear on SYED!',
        'Awesome update! The numerical UID discovery makes connecting so seamless.',
        'Checked it on my end, looking very solid and stable.',
        'Let’s test a high-definition voice or video call when you are free!',
      ],
      user_ahmed: [
        'Thanks Syed, reviewed the details. Looking sharp!',
        'Received! Will coordinate with the rest of the team.',
      ],
      user_sarah: [
        'Love the aesthetics and the sleek paper plane branding!',
        'Downloaded the vector kit, looks ultra crisp on retina screens.',
      ],
    };

    const replyList = responses[otherUserId] || [
      'Thanks for reaching out! Message received securely on SYED.',
      'Understood. Let me look into this right away.',
    ];

    const replyText = replyList[Math.floor(Math.random() * replyList.length)];

    setTimeout(() => {
      const allMessages = this.get<Message[]>(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES);
      const replyMsg: Message = {
        id: `msg_reply_${Date.now()}`,
        chatId,
        senderId: otherUser.id,
        senderName: otherUser.username,
        senderAvatar: otherUser.avatar,
        text: replyText,
        timestamp: Date.now(),
        status: 'read',
      };

      allMessages.push(replyMsg);
      this.set(STORAGE_KEYS.MESSAGES, allMessages);

      const chats = this.getChats();
      const cIdx = chats.findIndex((c) => c.id === chatId);
      if (cIdx >= 0) {
        chats[cIdx].updatedAt = Date.now();
        chats[cIdx].lastMessage = replyMsg;
        this.set(STORAGE_KEYS.CHATS, chats);
      }

      // Dispatch custom event so listeners know new message arrived
      window.dispatchEvent(new CustomEvent('syed:new_message', { detail: { chatId } }));
    }, 2500);
  }
}

export const storage = new StorageService();
