import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase/client";

/*
  DiVerge — Authentication.

  Uses Supabase when configured (real accounts, persisted sessions); otherwise
  falls back to the original local MOCK so the app keeps working before the
  keys are set. The public API is identical either way, so the rest of the app
  doesn't change.

  Profile fields (name, nickname, displayMode, avatarUrl, plan) live in the
  Supabase user's `user_metadata`.
*/

const STORAGE_KEY = "diverge.user"; // mock fallback only
const AuthContext = createContext(null);

// The name shown next to the avatar, honouring the user's choice.
export function displayName(user) {
  if (!user) return "";
  return user.displayMode === "name"
    ? user.name || user.nickname
    : user.nickname || user.name;
}

// Build our app's user from the Supabase auth user + the profiles table row.
// Falls back to user_metadata when the profile row isn't there yet.
async function buildUser(authUser) {
  if (!authUser) return null;
  const m = authUser.user_metadata ?? {};

  let profile = null;
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("nickname, name, display_mode, avatar_url, plan")
      .eq("id", authUser.id)
      .maybeSingle();
    profile = data;
  }

  const nickname =
    profile?.nickname ?? m.nickname ?? authUser.email?.split("@")[0] ?? "Esploratore";
  return {
    id: authUser.id,
    email: authUser.email,
    // OAuth providers (Google) use name/full_name + avatar_url/picture keys.
    name: profile?.name ?? m.name ?? m.full_name ?? nickname,
    nickname,
    displayMode: profile?.display_mode ?? m.displayMode ?? "nickname",
    avatarUrl: profile?.avatar_url ?? m.avatarUrl ?? m.avatar_url ?? m.picture ?? null,
    provider: authUser.app_metadata?.provider ?? "email",
    plan: profile?.plan ?? "free",
    createdAt: authUser.created_at,
  };
}

// --- mock fallback helpers ------------------------------------------------

function loadMockUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function makeMockUser(partial) {
  const nickname =
    partial.nickname ?? partial.email?.split("@")[0] ?? "Esploratore";
  return {
    id: crypto.randomUUID(),
    email: partial.email ?? "ospite@diverge.app",
    name: partial.name ?? nickname,
    nickname,
    displayMode: "nickname",
    avatarUrl: partial.avatarUrl ?? null,
    provider: partial.provider ?? "email",
    plan: "free",
    createdAt: new Date().toISOString(),
  };
}

const fakeDelay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    isSupabaseConfigured ? null : loadMockUser()
  );
  // While Supabase restores the session on first load, we're "loading".
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // Google OAuth access token for calling Google APIs (Calendar). It's
  // ephemeral — only present right after an OAuth sign-in. Persistent refresh
  // (refresh token + a serverless function) is a later step.
  const [googleToken, setGoogleToken] = useState(() => {
    try {
      return sessionStorage.getItem("diverge.gtoken");
    } catch {
      return null;
    }
  });

  // Supabase: restore session + subscribe to auth changes.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    const grabToken = (session) => {
      if (session?.provider_token) {
        try {
          sessionStorage.setItem("diverge.gtoken", session.provider_token);
        } catch {
          // ignore
        }
        setGoogleToken(session.provider_token);
      }
    };
    supabase.auth.getSession().then(async ({ data }) => {
      grabToken(data.session);
      const u = await buildUser(data.session?.user ?? null);
      if (!mounted) return;
      setUser(u);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      grabToken(session);
      buildUser(session?.user ?? null).then((u) => {
        if (mounted) setUser(u);
      });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Mock: persist the fake session.
  useEffect(() => {
    if (isSupabaseConfigured) return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo(() => {
    async function signInWithEmail(email, password) {
      if (!isSupabaseConfigured) {
        setLoading(true);
        await fakeDelay();
        setUser(makeMockUser({ email, provider: "email" }));
        setLoading(false);
        return {};
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message };
    }

    async function signUpWithEmail(email, password, nickname) {
      if (!isSupabaseConfigured) {
        setLoading(true);
        await fakeDelay();
        setUser(makeMockUser({ email, nickname, provider: "email" }));
        setLoading(false);
        return {};
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname, name: nickname, displayMode: "nickname" } },
      });
      if (error) return { error: error.message };
      // No session yet → the project requires email confirmation.
      if (!data.session) {
        return { info: "Controlla la tua email per confermare l'account." };
      }
      return {};
    }

    async function signInWithProvider(provider) {
      if (!isSupabaseConfigured) {
        setLoading(true);
        await fakeDelay();
        setUser(
          makeMockUser({ provider, email: `utente@${provider}.com`, nickname: `${provider}User` })
        );
        setLoading(false);
        return {};
      }
      // Meta is the "facebook" provider in Supabase.
      const supaProvider = provider === "meta" ? "facebook" : provider;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: supaProvider,
        options: { redirectTo: window.location.origin },
      });
      return { error: error?.message };
    }

    function clearGoogleToken() {
      try {
        sessionStorage.removeItem("diverge.gtoken");
      } catch {
        // ignore
      }
      setGoogleToken(null);
    }

    // Ask Google for additional scopes (e.g. Calendar). Redirects to Google,
    // then back with a provider_token. Best for users already signed in with
    // Google (same account gets the extra scope).
    async function connectGoogle(scopes) {
      if (!isSupabaseConfigured) return { error: "Supabase not configured" };
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes,
          redirectTo: window.location.origin + "/",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            include_granted_scopes: "true",
          },
        },
      });
      return { error: error?.message };
    }

    async function signOut() {
      clearGoogleToken();
      if (!isSupabaseConfigured) {
        setUser(null);
        return;
      }
      await supabase.auth.signOut();
    }

    async function updateProfile(updates) {
      // Optimistic update for snappy UI.
      setUser((u) => (u ? { ...u, ...updates } : u));
      if (isSupabaseConfigured && user?.id) {
        const row = { id: user.id, updated_at: new Date().toISOString() };
        if ("name" in updates) row.name = updates.name;
        if ("nickname" in updates) row.nickname = updates.nickname;
        if ("displayMode" in updates) row.display_mode = updates.displayMode;
        if ("avatarUrl" in updates) row.avatar_url = updates.avatarUrl;
        await supabase.from("profiles").upsert(row);
      }
    }

    return {
      user,
      loading,
      isAuthenticated: Boolean(user),
      supabaseReady: isSupabaseConfigured,
      googleToken,
      connectGoogle,
      clearGoogleToken,
      signInWithEmail,
      signUpWithEmail,
      signInWithProvider,
      signOut,
      updateProfile,
    };
  }, [user, loading, googleToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
