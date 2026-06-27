import { useCallback, useEffect, useState } from "react";
import {
  loadConfig,
  saveConfig as svcSaveConfig,
  clearConfig as svcClearConfig,
  fetchMessages,
  markRead as svcMarkRead,
  toggleStar as svcToggleStar,
  deleteMessage as svcDelete,
  sendMessage as svcSend,
} from "./imapService";

// One source of truth for the IMAP widget + its expanded view.
// Connected = an account is configured. Today everything is mock; the service
// is the swap point for the real serverless IMAP/SMTP proxy.
export function useImap() {
  const [config, setConfig] = useState(loadConfig);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  const connected = Boolean(config);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      setMessages(await fetchMessages());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (connected) refresh();
  }, [connected, refresh]);

  const saveConfig = useCallback(async (cfg) => {
    setConnecting(true);
    svcSaveConfig(cfg);
    setConfig(cfg);
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    svcClearConfig();
    setConfig(null);
    setMessages([]);
    setStatus("idle");
  }, []);

  const markRead = useCallback(async (id, read = true) => {
    await svcMarkRead(id, read);
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, unread: !read } : x)));
  }, []);

  const toggleStar = useCallback(async (id) => {
    await svcToggleStar(id);
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, starred: !x.starred } : x)));
  }, []);

  const remove = useCallback(async (id) => {
    await svcDelete(id);
    setMessages((m) => m.filter((x) => x.id !== id));
  }, []);

  const send = useCallback(async (payload) => svcSend(payload), []);

  const unread = messages.filter((m) => m.unread).length;
  const selfEmail = config?.email ?? "";

  return {
    connected,
    connecting,
    config,
    selfEmail,
    status,
    messages,
    unread,
    refresh,
    saveConfig,
    disconnect,
    markRead,
    toggleStar,
    remove,
    send,
  };
}
