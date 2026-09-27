import { supabase, isSupabaseConfigured, SUPABASE_PROJECT_URL } from './supabase';
import { User, Chat, Message, StatusItem, FileAttachment, CallSession, ReportItem } from '../types';

export class SupabaseService {
  private isConfigured = isSupabaseConfigured();
  private realtimeChannel: any = null;

  getStatus() {
    return {
      configured: this.isConfigured,
      projectUrl: SUPABASE_PROJECT_URL,
    };
  }

  // --- 1. EMAIL & PASSWORD AUTHENTICATION ---
  async signUp(params: {
    email: string;
    password: string;
    username: string;
    uid: number;
    bio?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase is not configured with anon key yet.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            username: params.username,
            uid: params.uid,
            bio: params.bio || 'Hey there! I am using SYED.',
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Sign up failed to return user.' };
      }

      const newUser: User = {
        id: authData.user.id,
        uid: params.uid,
        username: params.username,
        email: params.email,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${params.username}`,
        bio: params.bio || 'Hey there! I am using SYED.',
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

      // Fetch profile created by database trigger, or fallback to metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profile) {
        return {
          success: true,
          user: {
            id: profile.id,
            uid: profile.uid,
            username: profile.username,
            email: profile.email,
            avatar: profile.avatar_url || newUser.avatar,
            bio: profile.bio || newUser.bio,
            online: true,
            lastSeen: 'Online',
            blockedUsers: profile.blocked_users || [],
            privacySettings: profile.privacy_settings || newUser.privacySettings,
            notificationSettings: profile.notification_settings || newUser.notificationSettings,
            storageSettings: profile.storage_settings || newUser.storageSettings,
            appearanceSettings: profile.appearance_settings || newUser.appearanceSettings,
          },
        };
      }

      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase authentication error' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase is not configured with anon key yet.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Invalid user session returned.' };
      }

      // Fetch profile
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (pError || !profile) {
        // Fallback construct from auth metadata
        const user: User = {
          id: data.user.id,
          uid: data.user.user_metadata?.uid || 583927461,
          username: data.user.user_metadata?.username || email.split('@')[0],
          email: data.user.email || email,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
          bio: data.user.user_metadata?.bio || 'Hey there! I am using SYED.',
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
        return { success: true, user };
      }

      const user: User = {
        id: profile.id,
        uid: profile.uid,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar_url,
        bio: profile.bio,
        online: true,
        lastSeen: 'Online',
        blockedUsers: profile.blocked_users || [],
        privacySettings: profile.privacy_settings,
        notificationSettings: profile.notification_settings,
        storageSettings: profile.storage_settings,
        appearanceSettings: profile.appearance_settings,
      };

      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase login failed' };
    }
  }

  async signOut(): Promise<void> {
    if (this.isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out notice:', err);
      }
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) return { success: true };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // --- 2. PROFILES & USER DISCOVERY ---
  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    if (!this.isConfigured) return [];
    try {
      const clean = query.trim();
      const numUID = Number(clean);

      let req = supabase.from('profiles').select('*').neq('id', currentUserId);
      if (!isNaN(numUID) && clean.length >= 2) {
        req = req.or(`username.ilike.%${clean}%,uid.eq.${numUID}`);
      } else {
        req = req.ilike('username', `%${clean}%`);
      }

      const { data, error } = await req.limit(20);
      if (error || !data) return [];

      return data.map((p: any) => ({
        id: p.id,
        uid: p.uid,
        username: p.username,
        email: p.email,
        avatar: p.avatar_url,
        bio: p.bio,
        online: p.online,
        lastSeen: p.last_seen ? new Date(p.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Offline',
        blockedUsers: p.blocked_users || [],
        privacySettings: p.privacy_settings,
        notificationSettings: p.notification_settings,
        storageSettings: p.storage_settings,
        appearanceSettings: p.appearance_settings,
      }));
    } catch {
      return [];
    }
  }

  async updateProfile(user: User): Promise<void> {
    if (!this.isConfigured) return;
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        uid: user.uid,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar,
        bio: user.bio,
        online: user.online,
        last_seen: new Date().toISOString(),
        blocked_users: user.blockedUsers,
        privacy_settings: user.privacySettings,
        notification_settings: user.notificationSettings,
        storage_settings: user.storageSettings,
        appearance_settings: user.appearanceSettings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Update profile to Supabase notice:', err);
    }
  }

  // --- 3. CONVERSATIONS & CONVERSATION MEMBERS ---
  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<string> {
    if (!this.isConfigured) return `chat_direct_${Date.now()}`;
    try {
      // 1. Check conversation_members for existing direct chat between both users
      const { data: user1Members } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userId1);

      if (user1Members && user1Members.length > 0) {
        const convIds = user1Members.map((m: any) => m.conversation_id);
        const { data: sharedMembers } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', userId2)
          .in('conversation_id', convIds);

        if (sharedMembers && sharedMembers.length > 0) {
          // Verify if any of these conversations is a 'direct' chat
          const sharedIds = sharedMembers.map((m: any) => m.conversation_id);
          const { data: convData } = await supabase
            .from('conversations')
            .select('id, type')
            .in('id', sharedIds)
            .eq('type', 'direct')
            .limit(1)
            .maybeSingle();

          if (convData) {
            return convData.id;
          }
        }
      }

      // 2. Fallback check: check conversations table directly by participants array
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'direct')
        .contains('participants', [userId1, userId2])
        .limit(1)
        .maybeSingle();

      if (existingConvs) {
        return existingConvs.id;
      }

      // 3. Create new conversation in conversations table
      const newId = `direct_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await supabase.from('conversations').upsert({
        id: newId,
        type: 'direct',
        participants: [userId1, userId2],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // 4. Insert both participants into conversation_members
      await supabase.from('conversation_members').upsert([
        {
          id: `${newId}_${userId1}`,
          conversation_id: newId,
          user_id: userId1,
          role: 'member',
          joined_at: new Date().toISOString(),
        },
        {
          id: `${newId}_${userId2}`,
          conversation_id: newId,
          user_id: userId2,
          role: 'member',
          joined_at: new Date().toISOString(),
        },
      ]);

      return newId;
    } catch (err) {
      console.warn('getOrCreateDirectConversation notice:', err);
      return `chat_direct_${Date.now()}`;
    }
  }

  async fetchConversations(userId: string): Promise<Chat[]> {
    if (!this.isConfigured) return [];
    try {
      // 1. Fetch conversation IDs user is a member of via conversation_members
      const { data: memberRows } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userId);

      const convIdsFromMembers = memberRows ? memberRows.map((m: any) => m.conversation_id) : [];

      // 2. Also fetch conversations where participants contains userId
      let query = supabase.from('conversations').select('*');
      if (convIdsFromMembers.length > 0) {
        query = query.or(`id.in.(${convIdsFromMembers.map((id) => `"${id}"`).join(',')}),participants.cs.{${userId}}`);
      } else {
        query = query.contains('participants', [userId]);
      }

      const { data: convData, error } = await query.order('updated_at', { ascending: false });
      if (error || !convData) return [];

      const chats: Chat[] = [];

      for (const c of convData) {
        // Fetch all members for this conversation from conversation_members
        const { data: allMembers } = await supabase
          .from('conversation_members')
          .select('user_id, role')
          .eq('conversation_id', c.id);

        const memberUserIds = allMembers && allMembers.length > 0
          ? allMembers.map((m: any) => m.user_id)
          : (c.participants || []);

        const adminIds = allMembers && allMembers.length > 0
          ? allMembers.filter((m: any) => m.role === 'admin').map((m: any) => m.user_id)
          : (c.admin_ids || []);

        // Fetch latest message
        const { data: lastMsgData } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let lastMessage: Message | undefined;
        if (lastMsgData) {
          lastMessage = {
            id: lastMsgData.id,
            chatId: lastMsgData.conversation_id,
            senderId: lastMsgData.sender_id,
            senderName: lastMsgData.sender_name,
            senderAvatar: lastMsgData.sender_avatar,
            text: lastMsgData.text,
            attachments: lastMsgData.attachments,
            voiceNote: lastMsgData.voice_note,
            status: lastMsgData.status,
            replyTo: lastMsgData.reply_to,
            deletedFor: lastMsgData.deleted_for || [],
            isDeletedForEveryone: lastMsgData.is_deleted_for_everyone,
            forwarded: lastMsgData.forwarded,
            timestamp: new Date(lastMsgData.created_at).getTime(),
          };
        }

        chats.push({
          id: c.id,
          type: c.type,
          name: c.name,
          avatar: c.avatar_url,
          description: c.description,
          participants: memberUserIds,
          adminIds,
          onlyAdminsCanSend: c.only_admins_can_send,
          unreadCount: {},
          isMuted: c.is_muted,
          pinned: c.pinned,
          lastMessage,
          createdAt: new Date(c.created_at).getTime(),
          updatedAt: new Date(c.updated_at).getTime(),
        });
      }

      return chats;
    } catch {
      return [];
    }
  }

  async saveConversation(chat: Chat): Promise<void> {
    if (!this.isConfigured) return;
    try {
      // 1. Upsert conversations table
      await supabase.from('conversations').upsert({
        id: chat.id,
        type: chat.type,
        name: chat.name,
        avatar_url: chat.avatar,
        description: chat.description,
        participants: chat.participants,
        admin_ids: chat.adminIds || [],
        only_admins_can_send: chat.onlyAdminsCanSend || false,
        is_muted: chat.isMuted || false,
        pinned: chat.pinned || false,
        updated_at: new Date(chat.updatedAt).toISOString(),
      });

      // 2. Sync participants to conversation_members table
      if (chat.participants && chat.participants.length > 0) {
        const memberRows = chat.participants.map((userId) => ({
          id: `${chat.id}_${userId}`,
          conversation_id: chat.id,
          user_id: userId,
          role: chat.adminIds?.includes(userId) ? 'admin' : 'member',
          joined_at: new Date(chat.createdAt || Date.now()).toISOString(),
        }));
        await supabase.from('conversation_members').upsert(memberRows);
      }
    } catch (err) {
      console.warn('Save conversation to Supabase notice:', err);
    }
  }

  // --- 4. MESSAGES & MESSAGE ATTACHMENTS ---
  async fetchMessages(conversationId: string): Promise<Message[]> {
    if (!this.isConfigured) return [];
    try {
      // 1. Fetch messages
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error || !messagesData) return [];

      // 2. Fetch attachments from message_attachments table
      const messageIds = messagesData.map((m: any) => m.id);
      let attachmentsByMsgId: Record<string, FileAttachment[]> = {};
      let voiceNotesByMsgId: Record<string, any> = {};

      if (messageIds.length > 0) {
        const { data: attData } = await supabase
          .from('message_attachments')
          .select('*')
          .in('message_id', messageIds);

        if (attData && attData.length > 0) {
          for (const att of attData) {
            if (att.file_type === 'audio' && att.file_name === 'Voice Note') {
              voiceNotesByMsgId[att.message_id] = {
                id: att.id,
                url: att.file_url,
                duration: Number(att.file_size) || 1,
                waveformData: [30, 45, 60, 40, 75, 55, 30, 80, 50, 40],
              };
            } else {
              if (!attachmentsByMsgId[att.message_id]) {
                attachmentsByMsgId[att.message_id] = [];
              }
              attachmentsByMsgId[att.message_id].push({
                id: att.id,
                name: att.file_name,
                size: Number(att.file_size) || 0,
                type: (att.file_type as any) || 'file',
                url: att.file_url,
                mimeType: att.mime_type || 'application/octet-stream',
                quality: 'compressed',
              });
            }
          }
        }
      }

      return messagesData.map((m: any) => {
        // Prefer attachments from message_attachments if available, else jsonb column
        const normalizedAttachments = attachmentsByMsgId[m.id]?.length
          ? attachmentsByMsgId[m.id]
          : m.attachments || [];

        const normalizedVoiceNote = voiceNotesByMsgId[m.id] || m.voice_note || undefined;

        return {
          id: m.id,
          chatId: m.conversation_id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          senderAvatar: m.sender_avatar,
          text: m.text || m.content || '',
          attachments: normalizedAttachments,
          voiceNote: normalizedVoiceNote,
          status: m.status || 'sent',
          replyTo: m.reply_to,
          deletedFor: m.deleted_for || [],
          isDeletedForEveryone: m.is_deleted_for_everyone || false,
          forwarded: m.forwarded || false,
          timestamp: new Date(m.created_at).getTime(),
        };
      });
    } catch {
      return [];
    }
  }

  async saveMessage(msg: Message): Promise<void> {
    if (!this.isConfigured) return;
    try {
      // 1. Insert/Upsert into messages table
      await supabase.from('messages').upsert({
        id: msg.id,
        conversation_id: msg.chatId,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_avatar: msg.senderAvatar,
        text: msg.text,
        attachments: msg.attachments || [],
        voice_note: msg.voiceNote || null,
        status: msg.status,
        reply_to: msg.replyTo || null,
        deleted_for: msg.deletedFor || [],
        is_deleted_for_everyone: msg.isDeletedForEveryone || false,
        forwarded: msg.forwarded || false,
        created_at: new Date(msg.timestamp).toISOString(),
      });

      // 2. Insert into message_attachments table
      if (msg.attachments && msg.attachments.length > 0) {
        const attRows = msg.attachments.map((att, idx) => ({
          id: att.id || `${msg.id}_att_${idx}`,
          message_id: msg.id,
          file_url: att.url,
          file_name: att.name,
          file_size: att.size || 0,
          file_type: att.type || 'file',
          mime_type: att.mimeType || null,
          created_at: new Date(msg.timestamp).toISOString(),
        }));
        await supabase.from('message_attachments').upsert(attRows);
      }

      // 3. Voice note attachment
      if (msg.voiceNote) {
        await supabase.from('message_attachments').upsert({
          id: `${msg.id}_voice`,
          message_id: msg.id,
          file_url: msg.voiceNote.url,
          file_name: 'Voice Note',
          file_size: msg.voiceNote.duration,
          file_type: 'audio',
          mime_type: 'audio/webm',
          created_at: new Date(msg.timestamp).toISOString(),
        });
      }

      // 4. Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date(msg.timestamp).toISOString() })
        .eq('id', msg.chatId);
    } catch (err) {
      console.warn('Save message to Supabase notice:', err);
    }
  }

  // --- 5. ATTACHMENTS & SUPABASE STORAGE ---
  async uploadAttachment(file: File, bucket = 'attachments'): Promise<{ url: string; error?: string }> {
    if (!this.isConfigured) {
      // Fallback
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result as string });
        reader.onerror = () => resolve({ url: '#' });
        reader.readAsDataURL(file);
      });
    }

    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        // Fallback to base64 if bucket does not exist yet
        console.warn('Supabase storage upload notice:', error.message);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ url: reader.result as string });
          reader.readAsDataURL(file);
        });
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return { url: publicData.publicUrl };
    } catch (err: any) {
      return { url: '#', error: err.message };
    }
  }

  // --- 6. 24-HOUR TEMPORARY STATUS ---
  async fetchStatuses(): Promise<StatusItem[]> {
    if (!this.isConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        username: s.username,
        userAvatar: s.user_avatar,
        type: s.type,
        content: s.content,
        caption: s.caption,
        backgroundColor: s.background_color,
        createdAt: new Date(s.created_at).getTime(),
        expiresAt: new Date(s.expires_at).getTime(),
        viewers: s.viewers || [],
      }));
    } catch {
      return [];
    }
  }

  async saveStatus(status: StatusItem): Promise<void> {
    if (!this.isConfigured) return;
    try {
      await supabase.from('statuses').upsert({
        id: status.id,
        user_id: status.userId,
        username: status.username,
        user_avatar: status.userAvatar,
        type: status.type,
        content: status.content,
        caption: status.caption,
        background_color: status.backgroundColor,
        created_at: new Date(status.createdAt).toISOString(),
        expires_at: new Date(status.expiresAt).toISOString(),
        viewers: status.viewers || [],
      });
    } catch (err) {
      console.warn('Save status to Supabase notice:', err);
    }
  }

  // --- 7. REALTIME SUBSCRIPTION FOR MESSAGES & PRESENCE ---
  subscribeToConversation(
    conversationId: string,
    onNewMessage: (msg: Message) => void,
    onMessageUpdate?: (msg: Message) => void
  ) {
    if (!this.isConfigured) return () => {};

    try {
      const channel = supabase
        .channel(`chat_${conversationId}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          async (payload: any) => {
            const m = payload.new;
            // Fetch any attachments if available in message_attachments
            let attachments = m.attachments || [];
            let voiceNote = m.voice_note;

            try {
              const { data: attData } = await supabase
                .from('message_attachments')
                .select('*')
                .eq('message_id', m.id);

              if (attData && attData.length > 0) {
                const regularAtts: FileAttachment[] = [];
                for (const att of attData) {
                  if (att.file_type === 'audio' && att.file_name === 'Voice Note') {
                    voiceNote = {
                      id: att.id,
                      url: att.file_url,
                      duration: Number(att.file_size) || 1,
                      waveformData: [30, 45, 60, 40, 75, 55, 30, 80, 50, 40],
                    };
                  } else {
                    regularAtts.push({
                      id: att.id,
                      name: att.file_name,
                      size: Number(att.file_size) || 0,
                      type: (att.file_type as any) || 'file',
                      url: att.file_url,
                      mimeType: att.mime_type || 'application/octet-stream',
                      quality: 'compressed',
                    });
                  }
                }
                if (regularAtts.length > 0) {
                  attachments = regularAtts;
                }
              }
            } catch (e) {
              console.warn('Realtime attachment fetch notice:', e);
            }

            const newMsg: Message = {
              id: m.id,
              chatId: m.conversation_id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              senderAvatar: m.sender_avatar,
              text: m.text || m.content || '',
              attachments,
              voiceNote,
              status: m.status || 'sent',
              replyTo: m.reply_to,
              deletedFor: m.deleted_for || [],
              isDeletedForEveryone: m.is_deleted_for_everyone || false,
              forwarded: m.forwarded || false,
              timestamp: new Date(m.created_at).getTime(),
            };
            onNewMessage(newMsg);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload: any) => {
            const m = payload.new;
            const updatedMsg: Message = {
              id: m.id,
              chatId: m.conversation_id,
              senderId: m.sender_id,
              senderName: m.sender_name,
              senderAvatar: m.sender_avatar,
              text: m.text || m.content || '',
              attachments: m.attachments || [],
              voiceNote: m.voice_note,
              status: m.status || 'sent',
              replyTo: m.reply_to,
              deletedFor: m.deleted_for || [],
              isDeletedForEveryone: m.is_deleted_for_everyone || false,
              forwarded: m.forwarded || false,
              timestamp: new Date(m.created_at).getTime(),
            };
            if (onMessageUpdate) {
              onMessageUpdate(updatedMsg);
            } else {
              onNewMessage(updatedMsg);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription notice:', err);
      return () => {};
    }
  }

  subscribeToUserConversations(userId: string, onUpdate: () => void) {
    if (!this.isConfigured) return () => {};

    try {
      const channel = supabase
        .channel(`user_chats_${userId}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
          },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          () => onUpdate()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime user conversations subscription notice:', err);
      return () => {};
    }
  }

  // --- 8. CALLS & SIGNALING ---
  async saveCallSession(session: CallSession, currentUserId: string): Promise<void> {
    if (!this.isConfigured) return;
    try {
      await supabase.from('calls').upsert({
        id: session.id,
        type: session.type,
        caller_id: currentUserId,
        receiver_id: session.participant.id,
        status: session.status,
        duration: session.duration,
        started_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Call session save notice:', err);
    }
  }
}

export const supabaseService = new SupabaseService();
