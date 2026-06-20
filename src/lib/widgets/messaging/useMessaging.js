import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  loadChannel,
  saveChannel,
  fetchMyMessages,
  fetchProfiles,
  sendMessage,
  markRead,
  subscribeIncoming,
  searchUsers,
} from "./messagingService";

// One messaging widget instance. Only the "internal" channel is live.
export function useMessaging(instanceId) {
  const { user } = useAuth();
  const myId = user?.id ?? null;

  const [channel, setChannel] = useState(() => loadChannel(instanceId));
  const [messages, setMessages] = useState([]);
  const [peers, setPeers] = useState({});
  const [currentPeerId, setCurrentPeerId] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectChannel = useCallback(
    (c) => {
      setChannel(c);
      saveChannel(instanceId, c);
    },
    [instanceId]
  );

  // Load + subscribe (internal channel only).
  useEffect(() => {
    if (channel !== "internal" || !myId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const msgs = await fetchMyMessages(myId);
      const otherIds = [
        ...new Set(
          msgs.map((m) => (m.sender_id === myId ? m.recipient_id : m.sender_id))
        ),
      ];
      const pf = await fetchProfiles(otherIds);
      if (!active) return;
      setMessages(msgs);
      setPeers(pf);
      setLoading(false);
    })();

    const unsub = subscribeIncoming(myId, async (newMsg) => {
      setMessages((prev) =>
        prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
      );
      setPeers((prev) => {
        if (prev[newMsg.sender_id]) return prev;
        fetchProfiles([newMsg.sender_id]).then((pf) =>
          setPeers((p) => ({ ...p, ...pf }))
        );
        return prev;
      });
    });
    return () => {
      active = false;
      unsub();
    };
  }, [channel, myId]);

  const conversations = useMemo(() => {
    const byPeer = new Map();
    for (const m of messages) {
      const other = m.sender_id === myId ? m.recipient_id : m.sender_id;
      if (!byPeer.has(other))
        byPeer.set(other, { peerId: other, last: m, unread: 0 });
      const c = byPeer.get(other);
      c.last = m;
      if (m.recipient_id === myId && !m.read) c.unread += 1;
    }
    return [...byPeer.values()].sort(
      (a, b) => new Date(b.last.created_at) - new Date(a.last.created_at)
    );
  }, [messages, myId]);

  const currentMessages = useMemo(
    () =>
      messages.filter((m) => {
        const other = m.sender_id === myId ? m.recipient_id : m.sender_id;
        return other === currentPeerId;
      }),
    [messages, currentPeerId, myId]
  );

  const open = useCallback(
    async (peerId) => {
      setCurrentPeerId(peerId);
      await markRead(myId, peerId);
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === peerId && m.recipient_id === myId
            ? { ...m, read: true }
            : m
        )
      );
    },
    [myId]
  );

  const send = useCallback(
    async (content) => {
      const text = content.trim();
      if (!text || !currentPeerId || !myId) return;
      const { data } = await sendMessage(myId, currentPeerId, text);
      if (data) setMessages((prev) => [...prev, data]);
    },
    [currentPeerId, myId]
  );

  const startWith = useCallback((peer) => {
    setPeers((p) => ({ ...p, [peer.id]: peer }));
    setCurrentPeerId(peer.id);
  }, []);

  const back = useCallback(() => setCurrentPeerId(null), []);

  const unreadTotal = conversations.reduce((s, c) => s + c.unread, 0);

  return {
    myId,
    channel,
    selectChannel,
    loading,
    conversations,
    peers,
    currentPeerId,
    currentPeer: peers[currentPeerId] ?? null,
    currentMessages,
    unreadTotal,
    open,
    back,
    send,
    startWith,
    search: (q) => searchUsers(q, myId),
  };
}
