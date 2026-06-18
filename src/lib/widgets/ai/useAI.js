import { useCallback, useEffect, useState } from "react";
import {
  loadState,
  saveState,
  newConversation,
  titleFrom,
  generateReply,
  uid,
} from "./aiService";
import { useI18n } from "../../i18n/LanguageContext";

// One AI assistant instance: its model + its conversations.
export function useAI(instanceId) {
  const { t } = useI18n();
  const [state, setState] = useState(() => loadState(instanceId));
  const [currentId, setCurrentId] = useState(
    () => state.conversations[0]?.id ?? null
  );
  const [sending, setSending] = useState(false);

  // Persist whenever anything changes.
  useEffect(() => {
    saveState(instanceId, state);
  }, [instanceId, state]);

  const conversations = state.conversations;
  const current = conversations.find((c) => c.id === currentId) ?? null;

  const setModel = useCallback((model) => {
    setState((s) => ({ ...s, model }));
  }, []);

  const newChat = useCallback(() => {
    const conv = newConversation();
    setState((s) => ({ ...s, conversations: [conv, ...s.conversations] }));
    setCurrentId(conv.id);
    return conv;
  }, []);

  const selectChat = useCallback((id) => setCurrentId(id), []);

  const deleteChat = useCallback(
    (id) => {
      setState((s) => ({
        ...s,
        conversations: s.conversations.filter((c) => c.id !== id),
      }));
      setCurrentId((cur) => (cur === id ? null : cur));
    },
    []
  );

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || sending) return;

      const existing = state.conversations.find((c) => c.id === currentId);
      const conv = existing ?? newConversation();
      const convId = conv.id;
      const userMsg = { id: uid(), role: "user", content, time: Date.now() };
      const history = [...conv.messages, userMsg];

      setState((s) => {
        if (!existing) {
          return {
            ...s,
            conversations: [
              { ...conv, title: titleFrom(content), messages: [userMsg] },
              ...s.conversations,
            ],
          };
        }
        return {
          ...s,
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: c.messages.length === 0 ? titleFrom(content) : c.title,
                  messages: [...c.messages, userMsg],
                }
              : c
          ),
        };
      });
      setCurrentId(convId);
      setSending(true);

      const reply = await generateReply(state.model, history, t);
      const aiMsg = {
        id: uid(),
        role: "assistant",
        content: reply,
        time: Date.now(),
      };
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, aiMsg] } : c
        ),
      }));
      setSending(false);
    },
    [sending, currentId, state.conversations, state.model, t]
  );

  return {
    model: state.model,
    conversations,
    currentId,
    current,
    sending,
    setModel,
    newChat,
    selectChat,
    deleteChat,
    send,
  };
}
