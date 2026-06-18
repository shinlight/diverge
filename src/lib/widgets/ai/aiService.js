/*
  DiVerge — AI assistant service.

  Each AI widget instance has its OWN model choice + conversations, persisted
  under "diverge.ai.<instanceId>", so several AI widgets can run side by side,
  each talking to a different LLM.

  Replies are simulated for now. PHASE: replace generateReply() with a real
  provider call, picked by the selected model:
    Anthropic (Claude / Fable): POST https://api.anthropic.com/v1/messages
    OpenAI (GPT):               POST https://api.openai.com/v1/chat/completions
    Google (Gemini):            generativelanguage.googleapis.com/.../generateContent
  The widget UI never changes — only this file does.
*/

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const MODELS = [
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", provider: "Anthropic", color: "#d97757" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic", color: "#d97757" },
  { id: "fable-5", name: "Fable 5", provider: "Anthropic", color: "#d97757" },
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI", color: "#10a37f" },
  { id: "gemini-2-5-pro", name: "Gemini 2.5 Pro", provider: "Google", color: "#4285f4" },
];

export const DEFAULT_MODEL = MODELS[0].id;

export function modelById(id) {
  return MODELS.find((m) => m.id === id) ?? MODELS[0];
}

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

const key = (instanceId) => `diverge.ai.${instanceId}`;

export function loadState(instanceId) {
  try {
    const raw = localStorage.getItem(key(instanceId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { model: DEFAULT_MODEL, conversations: [] };
}

export function saveState(instanceId, state) {
  localStorage.setItem(key(instanceId), JSON.stringify(state));
}

export function clearState(instanceId) {
  localStorage.removeItem(key(instanceId));
}

export function newConversation() {
  return {
    id: uid(),
    title: "", // shown as the localized "New chat" until the first message
    messages: [],
    createdAt: new Date().toISOString(),
  };
}

// Title a conversation from its first user message (first ~6 words).
export function titleFrom(text) {
  const t = text.trim().replace(/\s+/g, " ");
  const short = t.split(" ").slice(0, 6).join(" ");
  return short.length < t.length ? `${short}…` : short || "Nuova chat";
}

// Simulated assistant reply (see header for the real-API swap point).
// `t` is the i18n translate function so the demo text follows the UI language.
export async function generateReply(modelId, messages, t) {
  await delay(650 + Math.random() * 650);
  const model = modelById(modelId);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const q = lastUser?.content?.trim() ?? "";
  const vars = { model: model.name, provider: model.provider, q };

  if (!q) return t("ai.demoEmpty", vars);

  return (
    `${t("ai.demoLine1", vars)}\n\n` +
    `${t("ai.demoYouWrote", vars)}\n\n` +
    `${t("ai.demoNote", vars)}`
  );
}
