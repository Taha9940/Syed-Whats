import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase configuration from environment variables
// Note: We use public/anon key only. NEVER use or expose service_role key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rkelveakxqnmxmaizidw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey.trim().length > 10
  );
};

// Initialize the Supabase JavaScript client
// Even if anon key is not yet set in environment, we instantiate a client safely
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://rkelveakxqnmxmaizidw.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export const SUPABASE_PROJECT_URL = supabaseUrl;

// Supabase Database Table Definitions & Schemas for SYED:
// - profiles (User profiles with 9-digit numerical UID, username, email, presence, settings)
// - conversations (Direct & Group channels)
// - conversation_participants (Mapping of users in conversations)
// - messages (Encrypted chat messages with status: sending, sent, delivered, read)
// - message_attachments (Photos, videos, docs, archives, voice notes)
// - statuses (24-hour temporary status updates)
// - status_views (Audience views on temporary statuses)
// - calls (Voice and video call sessions and WebRTC signaling)
// - reports (Moderation and security reports)
