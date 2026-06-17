import { createContext, useContext, useEffect, useMemo, useState } from "react";

/*
  DiVerge — Authentication layer (MOCK).

  This is a fake, local-only auth system so we can build the whole UI
  without any backend yet. It deliberately mirrors the shape of a real
  Supabase auth client, so Phase 2 is a drop-in swap:

    signInWithProvider("google")  ->  supabase.auth.signInWithOAuth({ provider: "google" })
    signInWithEmail(email, pw)     ->  supabase.auth.signInWithPassword({ email, password })
    signOut()                      ->  supabase.auth.signOut()
    user                           ->  supabase.auth.getUser()

  Nothing here talks to the network. The "session" lives in localStorage.
*/

const STORAGE_KEY = "diverge.user";
const AuthContext = createContext(null);

const PROVIDER_LABELS = {
  google: "Google",
  meta: "Meta",
};

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function makeMockUser(partial) {
  return {
    id: crypto.randomUUID(),
    email: partial.email ?? "ospite@diverge.app",
    nickname: partial.nickname ?? partial.email?.split("@")[0] ?? "Esploratore",
    avatarUrl: partial.avatarUrl ?? null,
    provider: partial.provider ?? "email",
    plan: "free", // predisposition for SaaS tiers (free | pro)
    createdAt: new Date().toISOString(),
  };
}

// Tiny delay so the UI's loading states feel real (and are easy to test).
const fakeDelay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [loading, setLoading] = useState(false);

  // Persist the "session".
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo(() => {
    async function signInWithProvider(provider) {
      setLoading(true);
      await fakeDelay();
      const label = PROVIDER_LABELS[provider] ?? provider;
      setUser(
        makeMockUser({
          provider,
          email: `utente@${provider}.com`,
          nickname: `${label}User`,
        })
      );
      setLoading(false);
    }

    async function signInWithEmail(email) {
      setLoading(true);
      await fakeDelay();
      setUser(makeMockUser({ email, provider: "email" }));
      setLoading(false);
    }

    async function signUpWithEmail(email, _password, nickname) {
      setLoading(true);
      await fakeDelay();
      setUser(makeMockUser({ email, nickname, provider: "email" }));
      setLoading(false);
    }

    async function signOut() {
      setLoading(true);
      await fakeDelay(300);
      setUser(null);
      setLoading(false);
    }

    function updateProfile(updates) {
      setUser((u) => (u ? { ...u, ...updates } : u));
    }

    return {
      user,
      loading,
      isAuthenticated: Boolean(user),
      signInWithProvider,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updateProfile,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
