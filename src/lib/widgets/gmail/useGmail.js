import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  isConnected,
  connect as svcConnect,
  fetchMessages,
  fetchGmailMessages,
  getGmailBody,
  getAttachment,
  modifyLabels,
  trashGmail,
  sendGmail,
  markRead as svcMarkRead,
  toggleStar as svcToggleStar,
  deleteMessage as svcDelete,
  sendMessage as svcSend,
  GMAIL_SCOPES,
} from "./gmailService";

// One source of truth for the Gmail widget + its focus view.
// - Real mode (Supabase): the user's real inbox via the shared Google token,
//   fully interactive (read / star / mark / trash / send) — gmail.modify+send.
// - Mock mode (local dev): the in-memory demo inbox, fully interactive.
export function useGmail() {
  const {
    supabaseReady,
    googleToken,
    connectGoogle,
    clearGoogleToken,
    refreshGoogleToken,
    user,
  } = useAuth();
  const realMode = supabaseReady;
  const selfEmail = user?.email ?? "";

  const [mockConnected, setMockConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [gmailReady, setGmailReady] = useState(false); // real: scopes granted & fetch ok
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  // In real mode "connected" means the inbox actually loaded (scopes granted).
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
        // The token lacks the Gmail scopes → ask the user to connect Gmail.
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
      await connectGoogle(GMAIL_SCOPES); // redirects to Google
      setConnecting(false);
      return;
    }
    setConnecting(true);
    await svcConnect();
    setConnecting(false);
    setMockConnected(true);
  }, [realMode, connectGoogle]);

  // Lazy-load a message body + attachments when it's opened (real mode).
  const loadBody = useCallback(
    async (id) => {
      if (!realMode || !googleToken) return;
      const msg = messages.find((m) => m.id === id);
      if (!msg || msg.body != null) return;
      try {
        const { body, attachments } = await getGmailBody(googleToken, id);
        setMessages((list) =>
          list.map((m) => (m.id === id ? { ...m, body, attachments } : m))
        );
      } catch {
        // leave body null → reader falls back to the snippet
      }
    },
    [realMode, googleToken, messages]
  );

  // Open an attachment in a new tab (downloads if the browser can't render it).
  const openAttachment = useCallback(
    async (messageId, att) => {
      if (!realMode || !googleToken) return;
      try {
        const b64url = await getAttachment(googleToken, messageId, att.id);
        const bin = atob(b64url.replace(/-/g, "+").replace(/_/g, "/"));
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(
          new Blob([bytes], { type: att.mimeType })
        );
        window.open(url, "_blank", "noopener");
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch {
        // ignore
      }
    },
    [realMode, googleToken]
  );

  const markRead = useCallback(
    async (id, read = true) => {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, unread: !read } : x)));
      try {
        if (realMode) {
          await modifyLabels(googleToken, id, {
            [read ? "remove" : "add"]: ["UNREAD"],
          });
        } else {
          await svcMarkRead(id, read);
        }
      } catch {
        // best-effort; visual state already applied
      }
    },
    [realMode, googleToken]
  );

  const toggleStar = useCallback(
    async (id) => {
      const msg = messages.find((x) => x.id === id);
      const next = !msg?.starred;
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, starred: next } : x)));
      try {
        if (realMode) {
          await modifyLabels(googleToken, id, {
            [next ? "add" : "remove"]: ["STARRED"],
          });
        } else {
          await svcToggleStar(id);
        }
      } catch {
        // revert on failure
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, starred: !next } : x)));
      }
    },
    [realMode, googleToken, messages]
  );

  const remove = useCallback(
    async (id) => {
      setMessages((m) => m.filter((x) => x.id !== id));
      try {
        if (realMode) await trashGmail(googleToken, id);
        else await svcDelete(id);
      } catch {
        // ignore (already removed from the list)
      }
    },
    [realMode, googleToken]
  );

  const send = useCallback(
    async (payload) => {
      if (realMode) {
        try {
          await sendGmail(googleToken, payload);
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }
      return svcSend(payload);
    },
    [realMode, googleToken]
  );

  const unread = messages.filter((m) => m.unread).length;

  return {
    connected,
    connecting,
    realMode,
    selfEmail, // used to drop yourself from reply-all
    status,
    messages,
    unread,
    connect,
    refresh,
    loadBody,
    openAttachment,
    markRead,
    toggleStar,
    remove,
    send,
  };
}
