import { supabase } from "../../supabase/client";

/*
  Divergify — Messaging service.

  Multi-channel by design: each widget instance picks a channel. Only the
  "internal" Divergify channel is live (real, via Supabase). The others are
  declared here so the UI + architecture are ready — adding a real one later
  is just a new entry + its fetch/send functions.

  Real-integration notes for the future channels:
    telegram → Telegram Bot API (a bot; not personal-chat mirroring)
    whatsapp → WhatsApp Business API or wa.me deep links (no personal API)
    imessage → not possible on the web (Apple exposes no API)
*/

export const CHANNELS = {
  internal: { id: "internal", name: "Divergify", color: "#7c5cff", status: "live" },
  whatsapp: { id: "whatsapp", name: "WhatsApp", color: "#25d366", status: "soon" },
  telegram: { id: "telegram", name: "Telegram", color: "#2aabee", status: "soon" },
  imessage: { id: "imessage", name: "iMessage", color: "#34c759", status: "unavailable" },
};
export const CHANNEL_LIST = Object.values(CHANNELS);

const channelKey = (instanceId) => `diverge.msg.${instanceId}.channel`;
export const loadChannel = (instanceId) =>
  localStorage.getItem(channelKey(instanceId)) || "internal";
export const saveChannel = (instanceId, channel) =>
  localStorage.setItem(channelKey(instanceId), channel);

// --- internal channel (Supabase) ----------------------------------------

export async function searchUsers(query, excludeId) {
  if (!supabase) return [];
  let q = supabase
    .from("profiles")
    .select("id, nickname, name, avatar_url")
    .limit(8);
  const term = query.trim();
  if (term) q = q.or(`nickname.ilike.%${term}%,name.ilike.%${term}%`);
  const { data } = await q;
  return (data || []).filter((u) => u.id !== excludeId);
}

export async function fetchMyMessages(myId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function fetchProfiles(ids) {
  if (!supabase || ids.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, nickname, name, avatar_url")
    .in("id", ids);
  const map = {};
  (data || []).forEach((p) => (map[p.id] = p));
  return map;
}

export async function sendMessage(senderId, recipientId, content) {
  if (!supabase) return { error: "not configured" };
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, recipient_id: recipientId, content })
    .select()
    .single();
  return { data, error: error?.message };
}

export async function markRead(myId, peerId) {
  if (!supabase) return;
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("recipient_id", myId)
    .eq("sender_id", peerId)
    .eq("read", false);
}

// Live-stream messages addressed to me. Returns an unsubscribe function.
export function subscribeIncoming(myId, onInsert) {
  if (!supabase) return () => {};
  // Unique topic per subscription: several Messaging widget instances (and
  // re-subscribes) must NOT share a channel name, otherwise the second call
  // reuses an already-subscribed channel and Supabase throws
  // "cannot add postgres_changes callbacks ... after subscribe()". The row
  // filter below (recipient_id) is what actually scopes the stream.
  const ch = supabase
    .channel(`messages:${myId}:${crypto.randomUUID().slice(0, 8)}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `recipient_id=eq.${myId}`,
      },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(ch);
}

export function msgTime(iso, lang = "en") {
  return new Date(iso).toLocaleTimeString(lang === "it" ? "it-IT" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const peerName = (p) => p?.nickname || p?.name || "—";
