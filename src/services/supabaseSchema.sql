-- ====================================================================
-- SYED MESSAGING & COMMUNICATION PLATFORM — SUPABASE DATABASE SCHEMA
-- Project URL: https://rkelveakxqnmxmaizidw.supabase.co
-- ====================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  uid BIGINT UNIQUE NOT NULL, -- Permanent 9-digit numerical UID (e.g. 583927461)
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT 'Hey there! I am using SYED.',
  online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT now(),
  blocked_users TEXT[] DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{"showOnlineStatus": true, "showLastSeen": true, "statusAudience": "all", "profileVisibility": "all"}'::jsonb,
  notification_settings JSONB DEFAULT '{"messages": true, "groups": true, "calls": true, "status": true, "sound": true, "vibration": true, "messagePreview": true}'::jsonb,
  storage_settings JSONB DEFAULT '{"autoDownloadMedia": true, "compressionPreference": "compressed", "maxFileSizeMB": 500}'::jsonb,
  appearance_settings JSONB DEFAULT '{"theme": "system", "accentColor": "#16B8A6"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for instant username and numerical UID searches
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_uid ON public.profiles(uid);

-- 2. CONVERSATIONS TABLE (Direct chats and Groups)
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  name TEXT, -- Group name
  avatar_url TEXT,
  description TEXT,
  participants TEXT[] NOT NULL DEFAULT '{}', -- Array of user IDs
  admin_ids TEXT[] DEFAULT '{}', -- Group admins
  only_admins_can_send BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN (participants);

-- 2.1 CONVERSATION MEMBERS (Normalized membership mapping for 1-to-1 & groups)
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conv ON public.conversation_members(conversation_id);

-- 3. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT DEFAULT '',
  text TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]'::jsonb,
  voice_note JSONB,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  reply_to JSONB,
  deleted_for TEXT[] DEFAULT '{}',
  is_deleted_for_everyone BOOLEAN DEFAULT false,
  forwarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

-- 3.1 MESSAGE ATTACHMENTS (Photos, videos, audio, docs, archives, voice notes)
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  message_id TEXT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  file_type TEXT DEFAULT 'file',
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_msg ON public.message_attachments(message_id);

-- 4. 24-HOUR TEMPORARY STATUS TABLE
CREATE TABLE IF NOT EXISTS public.statuses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  user_avatar TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('text', 'photo', 'video')),
  content TEXT NOT NULL,
  caption TEXT,
  background_color TEXT DEFAULT 'from-[#16324F] to-[#101820]',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  viewers JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_statuses_user_expires ON public.statuses(user_id, expires_at);

-- 5. CALLS TABLE (Voice & Video Calling sessions + WebRTC signaling)
CREATE TABLE IF NOT EXISTS public.calls (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL CHECK (type IN ('voice', 'video')),
  caller_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  status TEXT DEFAULT 'calling' CHECK (status IN ('calling', 'ringing', 'connected', 'declined', 'missed', 'failed', 'ended')),
  duration INTEGER DEFAULT 0,
  signal_data JSONB, -- WebRTC SDP Offer/Answer and ICE candidates
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calls_participants ON public.calls(caller_id, receiver_id, status);

-- 6. REPORTS TABLE (Security, Abuse & Spam Reports)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'message', 'group')),
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow public read of profiles for user discovery (by username and UID)
CREATE POLICY "Public profiles are searchable" ON public.profiles
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER & FUNCTION
-- Runs on auth.users AFTER INSERT with SECURITY DEFINER to bypass RLS
-- Generates or persists permanent 9-digit UID and username metadata
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid BIGINT;
  v_username TEXT;
  v_avatar TEXT;
  v_bio TEXT;
  v_uid_candidate BIGINT;
  v_exists BOOLEAN;
BEGIN
  -- 1. Extract or generate permanent 9-digit numerical UID (between 100000000 and 999999999)
  IF (NEW.raw_user_meta_data->>'uid') IS NOT NULL AND (NEW.raw_user_meta_data->>'uid') ~ '^[0-9]{9}$' THEN
    v_uid := (NEW.raw_user_meta_data->>'uid')::BIGINT;
    -- Verify this UID isn't already used
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE uid = v_uid) INTO v_exists;
    IF v_exists THEN
      v_uid := NULL;
    END IF;
  END IF;

  -- If UID is missing or collided, generate a unique random 9-digit UID
  WHILE v_uid IS NULL LOOP
    v_uid_candidate := floor(100000000 + (random() * 900000000))::BIGINT;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE uid = v_uid_candidate) INTO v_exists;
    IF NOT v_exists THEN
      v_uid := v_uid_candidate;
    END IF;
  END LOOP;

  -- 2. Extract or derive username from signup metadata
  v_username := TRIM(COALESCE(NEW.raw_user_meta_data->>'username', ''));
  IF v_username = '' THEN
    v_username := split_part(COALESCE(NEW.email, 'user'), '@', 1);
  END IF;

  -- Ensure username uniqueness
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username AND id <> NEW.id) INTO v_exists;
  IF v_exists THEN
    v_username := v_username || '_' || floor(1000 + (random() * 9000))::TEXT;
  END IF;

  -- 3. Extract avatar and bio
  v_avatar := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    'https://api.dicebear.com/7.x/identicon/svg?seed=' || v_username
  );

  v_bio := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'bio'), ''),
    'Hey there! I am using SYED.'
  );

  -- 4. Insert profile (idempotent: prevent duplicate profiles via ON CONFLICT)
  INSERT INTO public.profiles (
    id,
    uid,
    username,
    email,
    avatar_url,
    bio,
    online,
    last_seen,
    blocked_users,
    privacy_settings,
    notification_settings,
    storage_settings,
    appearance_settings,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_uid,
    v_username,
    COALESCE(NEW.email, ''),
    v_avatar,
    v_bio,
    true,
    now(),
    '{}'::TEXT[],
    '{"showOnlineStatus": true, "showLastSeen": true, "statusAudience": "all", "profileVisibility": "all"}'::jsonb,
    '{"messages": true, "groups": true, "calls": true, "status": true, "sound": true, "vibration": true, "messagePreview": true}'::jsonb,
    '{"autoDownloadMedia": true, "compressionPreference": "compressed", "maxFileSizeMB": 500}'::jsonb,
    '{"theme": "system", "accentColor": "#16B8A6"}'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to execute the function whenever a user is inserted in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- SAFE BACKFILL SCRIPT FOR EXISTING AUTH USERS
-- Run this to create missing profiles for existing auth.users without deleting them
-- ====================================================================
DO $$
DECLARE
  r RECORD;
  v_uid BIGINT;
  v_candidate BIGINT;
  v_exists BOOLEAN;
  v_username TEXT;
  v_bio TEXT;
  v_avatar TEXT;
BEGIN
  FOR r IN 
    SELECT u.id, u.email, u.raw_user_meta_data 
    FROM auth.users u 
    LEFT JOIN public.profiles p ON u.id = p.id 
    WHERE p.id IS NULL
  LOOP
    -- UID selection
    v_uid := NULL;
    IF (r.raw_user_meta_data->>'uid') IS NOT NULL AND (r.raw_user_meta_data->>'uid') ~ '^[0-9]{9}$' THEN
      v_candidate := (r.raw_user_meta_data->>'uid')::BIGINT;
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE uid = v_candidate) INTO v_exists;
      IF NOT v_exists THEN
        v_uid := v_candidate;
      END IF;
    END IF;

    WHILE v_uid IS NULL LOOP
      v_candidate := floor(100000000 + (random() * 900000000))::BIGINT;
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE uid = v_candidate) INTO v_exists;
      IF NOT v_exists THEN
        v_uid := v_candidate;
      END IF;
    END LOOP;

    -- Username selection
    v_username := TRIM(COALESCE(r.raw_user_meta_data->>'username', ''));
    IF v_username = '' THEN
      v_username := split_part(COALESCE(r.email, 'user'), '@', 1);
    END IF;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = v_username) INTO v_exists;
    IF v_exists THEN
      v_username := v_username || '_' || floor(1000 + (random() * 9000))::TEXT;
    END IF;

    -- Avatar & Bio
    v_avatar := COALESCE(
      NULLIF(TRIM(r.raw_user_meta_data->>'avatar_url'), ''),
      'https://api.dicebear.com/7.x/identicon/svg?seed=' || v_username
    );
    v_bio := COALESCE(
      NULLIF(TRIM(r.raw_user_meta_data->>'bio'), ''),
      'Hey there! I am using SYED.'
    );

    INSERT INTO public.profiles (
      id, uid, username, email, avatar_url, bio, online, last_seen,
      blocked_users, privacy_settings, notification_settings,
      storage_settings, appearance_settings, created_at, updated_at
    ) VALUES (
      r.id, v_uid, v_username, COALESCE(r.email, ''), v_avatar, v_bio, false, now(),
      '{}'::TEXT[],
      '{"showOnlineStatus": true, "showLastSeen": true, "statusAudience": "all", "profileVisibility": "all"}'::jsonb,
      '{"messages": true, "groups": true, "calls": true, "status": true, "sound": true, "vibration": true, "messagePreview": true}'::jsonb,
      '{"autoDownloadMedia": true, "compressionPreference": "compressed", "maxFileSizeMB": 500}'::jsonb,
      '{"theme": "system", "accentColor": "#16B8A6"}'::jsonb,
      now(), now()
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (auth.uid()::text = ANY(participants));

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND auth.uid()::text = ANY(c.participants)
    )
  );

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND auth.uid()::text = ANY(c.participants)
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid()::text = sender_id);

-- Statuses policies (publicly readable within 24 hours)
CREATE POLICY "Statuses are viewable if not expired" ON public.statuses
  FOR SELECT USING (expires_at > now());

CREATE POLICY "Users can insert own status" ON public.statuses
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own status" ON public.statuses
  FOR DELETE USING (auth.uid()::text = user_id);

-- Calls policies
CREATE POLICY "Users can view and participate in calls" ON public.calls
  FOR ALL USING (auth.uid()::text = caller_id OR auth.uid()::text = receiver_id);

-- Reports policies
CREATE POLICY "Users can submit reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid()::text = reporter_id);

-- Conversation Members policies
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversation members" ON public.conversation_members
  FOR SELECT USING (true);

CREATE POLICY "Users can insert conversation members" ON public.conversation_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete conversation members" ON public.conversation_members
  FOR DELETE USING (auth.uid()::text = user_id);

-- Message Attachments policies
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view message attachments" ON public.message_attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert message attachments" ON public.message_attachments
  FOR INSERT WITH CHECK (true);

-- ====================================================================
-- REALTIME SUBSCRIPTIONS SETUP
-- Enable Realtime for live messaging, presence, status, and calling
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.statuses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
