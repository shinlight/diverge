import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  isConnected,
  connect as svcConnect,
  fetchMessages,
  fetchGmailMessages,
  getGmailBody,
  markRead as svcMarkRead,
  toggleStar as svcToggleStar,
  deleteMessage as svcDelete,
  sendMessage as svcSend,
  GMAIL_READONLY_SCOPE,
} from "./gmailService";

// One source of truth for the Gmail widget + its focus view.
// - Real mode (Supabase): read the user's real inbox with the shared Google
//   token. Read-only — gmail.readonly scope only.
// - Mock mode (local dev): the in-memory demo inbox, fully interactive.
export function useGmail() {
  const {
    supabaseReady,
    googleToken,
    connectGoogle,
    clearGoogleToken,
    refreshGoogleToken,
  } = useAuth();
  const realMode = supabaseReady;

  const [mockConnected, setMockConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [gmailReady, setGmailReady] = useState(false); // real: scope granted & fetch ok
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // In real mode "connected" means the inbox actually loaded (gmail scope
  // granted). In mock mode it's the local flag.
  const connected = realMode ? gmailReady : mockConnected;

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      if (realMode) {
        if (!googleToken) {
          setGmailReady(false);
          setStatus("idle");
          return;
        }
        setMessages(await fetchGmailMessages(googleToken));
        setGmailReady(true);
        setStatus("ready");
      } else {
        setMessages(await fetchMessages());
        setStatus("ready");
      }
    } catch (e) {
      if (realMode && e?.code === 401) {
        const fresh = await refreshGoogleToken?.();
        if (fresh) return; // token change re-triggers the probe effect
        clearGoogleToken();
      }
      if (realMode && e?.code === 403) {
        // The token is valid but lacks gmail.readonly → ask to connect Gmail.
        setGmailReady(false);
        setStatus("idle");
        return;
      }
      setStatus("error");
    }
  }, [realMode, googleToken, refreshGoogleToken, clearGoogleToken]);

  // Probe on mount / when the token appears; mock loads when connected.
  useEffect(() => {
    if (realMode) {
      if (googleToken) refresh();
    } else if (mockConnected) {
      refresh();
    }
  }, [realMode, googleToken, mockConnected, refresh]);

  const connect = useCallback(async () => {
    if (realMode) {
      setConnecting(true);
      await connectGoogle(GMAIL_READONLY_SCOPE); // redirects to Google
      setConnecting(false);
      return;
    }
    setConnecting(true);
    await svcConnect();
    setConnecting(false);
    setMockConnected(true);
  }, [realMode, connectGoogle]);

  // Lazy-load a message body when it's opened (real mode only; mock has it).
  const loadBody = useCallback(
    async (id) => {
      if (!realMode || !googleToken) return;
      const msg = messages.find((m) => m.id === id);
      if (!msg || msg.body != null) return;
      try {
        const body = await getGmailBody(googleToken, id);
        setMessages((list) =>
          list.map((m) => (m.id === id ? { ...m, body } : m))
        );
      } catch {
        // leave body null → reader falls back to the snippet
      }
    },
    [realMode, googleToken, messages]
  );

  // Mark read: real mode is read-only, so update locally only (visual).
  const markRead = useCallback(
    async (id, read = true) => {
      if (!realMode) await svcMarkRead(id, read);
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, unread: !read } : x)));
    },
    [realMode]
  );

  // Star / delete / send are disabled in real mode (read-only).
  const toggleStar = useCallback(
    async (id) => {
      if (realMode) return;
      await svcToggleStar(id);
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, starred: !x.starred } : x)));
    },
    [realMode]
  );

  const remove = useCallback(
    async (id) => {
      if (realMode) return;
      await svcDelete(id);
      setMessages((m) => m.filter((x) => x.id !== id));
    },
    [realMode]
  );

  const send = useCallback(
    async (payload) => {
      if (realMode) return { ok: false };
      return svcSend(payload);
    },
    [realMode]
  );

  const unread = messages.filter((m) => m.unread).length;

  return {
    connected,
    connecting,
    realMode, // true → real inbox, read-only
    status,
    messages,
    unread,
    connect,
    refresh,
    loadBody,
    markRead,
    toggleStar,
    remove,
    send,
  };
}
