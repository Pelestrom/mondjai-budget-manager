import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Env = Record<string, string | undefined>;
const env = import.meta.env as unknown as Env;

// These are public values (URL + anon/public key). They can safely ship to the client.
// We keep env as the primary source, and fall back to known project defaults to avoid a blank screen.
const FALLBACK_PROJECT_ID = "wtzbmqksqboivxtpgsjl";
const FALLBACK_URL = `https://${FALLBACK_PROJECT_ID}.supabase.co`;
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0emJtcWtzcWJvaXZ4dHBnc2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTk1MDcsImV4cCI6MjA4MjgzNTUwN30.T4nDUxS1MDh4RqZkeyIYtvNX48qi6od_GylAQj5MLOQ";

const projectId = env.VITE_SUPABASE_PROJECT_ID || env.SUPABASE_PROJECT_ID;

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  (projectId ? `https://${projectId}.supabase.co` : undefined) ||
  FALLBACK_URL;

const supabaseAnonKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  FALLBACK_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
