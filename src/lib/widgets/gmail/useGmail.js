import { useCallback, useEffect, useState } from "react";
import {
  isConnected,
  connect as svcConnect,
  fetchMessages,
  markRead as svcMarkRead,
  toggleStar as svcToggleStar,
  deleteMessage as svcDelete,
  sendMessage as svcSend,
} from "./gmailService";

// One source of truth for the Gmail widget + its focus view.
export function useGmail() {
  const [connected, setConnected] = useState(isConnected);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

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

  const connect = useCallback(async () => {
    setConnecting(true);
    await svcConnect();
    setConnecting(false);
    setConnected(true);
  }, []);

  const markRead = useCallback(async (id, read = true) => {
    await svcMarkRead(id, read);
    setMessages((m) =>
      m.map((x) => (x.id === id ? { ...x, unread: !read } : x))
    );
  }, []);

  const toggleStar = useCallback(async (id) => {
    await svcToggleStar(id);
    setMessages((m) =>
      m.map((x) => (x.id === id ? { ...x, starred: !x.starred } : x))
    );
  }, []);

  const remove = useCallback(async (id) => {
    await svcDelete(id);
    setMessages((m) => m.filter((x) => x.id !== id));
  }, []);

  const send = useCallback(async (payload) => {
    return svcSend(payload);
  }, []);

  const unread = messages.filter((m) => m.unread).length;

  return {
    connected,
    connecting,
    status,
    messages,
    unread,
    connect,
    refresh,
    markRead,
    toggleStar,
    remove,
    send,
  };
}
