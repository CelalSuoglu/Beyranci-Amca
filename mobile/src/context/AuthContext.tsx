import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { registerForPush, unregisterPush } from "../lib/notifications";

export type AppRole = "customer" | "staff" | "admin";
export type Profile = { full_name: string | null; phone: string | null; role: AppRole };

type AuthValue = {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  isStaff: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      return;
    }
    // Rol her zaman veritabanından okunur; ekranlar buna göre açılır, yetki sunucuda kontrol edilir
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, role")
      .eq("id", s.user.id)
      .maybeSingle();
    setProfile({
      full_name: (data?.full_name as string | null) ?? null,
      phone: (data?.phone as string | null) ?? null,
      role: ((data?.role as AppRole | undefined) ?? "customer"),
    });
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session);
      setReady(true);
      // İzin daha önce verildiyse anahtarı sessizce yenile (yeni izin sormaz)
      if (data.session) void registerForPush({ prompt: false });
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      void loadProfile(next);
      if (event === "SIGNED_IN") void registerForPush({ prompt: false });
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(session), [loadProfile, session]);

  const signOut = useCallback(async () => {
    await unregisterPush();
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      profile,
      isStaff: profile?.role === "staff" || profile?.role === "admin",
      isAdmin: profile?.role === "admin",
      refreshProfile,
      signOut,
    }),
    [ready, session, profile, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider içinde kullanılmalı");
  return ctx;
}
