import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  settings: UserSettings | null;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  focus_duration: number;
  break_duration: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data as Profile);
  };

  const fetchSettings = async (userId: string) => {
    const { data } = await supabase.from("user_settings").select("*").eq("id", userId).single();
    if (data) setSettings(data as UserSettings);
  };

  const refreshProfile = async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchSettings(user.id)]);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchSettings(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setSettings(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSettings(session.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to get session:", err);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const withTimeout = async <T,>(promise: Promise<T>, ms = 10000): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms)
        ),
      ]);

    const attemptSignIn = async () => {
      const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
      return { error };
    };

    try {
      return await attemptSignIn();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      const isNetworkIssue = /fetch|network|timed out/i.test(message);

      if (!isNetworkIssue) return { error: err };

      // Clear potentially stale auth token and retry once
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-") && key.endsWith("-auth-token"))
        .forEach((key) => localStorage.removeItem(key));

      try {
        return await attemptSignIn();
      } catch (retryErr) {
        return { error: retryErr };
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;
    const { error } = await supabase.from("user_settings").update(updates).eq("id", user.id);
    if (error) throw error;
    await fetchSettings(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, settings, signUp, signIn, signOut, updateProfile, updateSettings, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // During HMR the context module can briefly desync from the provider.
    // Return a no-op shape instead of crashing the whole tree.
    return {
      user: null,
      session: null,
      loading: true,
      profile: null,
      settings: null,
      signUp: async () => ({ error: new Error("Auth not ready") }),
      signIn: async () => ({ error: new Error("Auth not ready") }),
      signOut: async () => {},
      updateProfile: async () => {},
      updateSettings: async () => {},
      refreshProfile: async () => {},
    } as AuthContextType;
  }
  return context;
};
