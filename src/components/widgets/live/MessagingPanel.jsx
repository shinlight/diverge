import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Plus, ArrowLeft, MessagesSquare } from "lucide-react";
import Avatar from "../../ui/Avatar";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import { peerName } from "../../../lib/widgets/messaging/messagingService";
import { ChannelSelect, ConversationRow, NewChatSearch, MessageThread } from "./msgChat";

export default function MessagingPanel({ open, onClose, ms, title, initialNew }) {
  const { t } = useI18n();
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (open) setShowNew(Boolean(initialNew));
  }, [open, initialNew]);

  const peer = ms.currentPeer;
  const paneActive = Boolean(ms.currentPeerId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: "#0ea5e91a", color: "#0ea5e9" }}>
                <MessageCircle size={18} />
              </span>
              <h2 className="truncate text-base font-semibold">{title}</h2>
              <div className="ml-auto flex items-center gap-2">
                <ChannelSelect channel={ms.channel} onSelect={ms.selectChannel} align="right" />
                <button
                  onClick={onClose}
                  aria-label={t("common.close")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1">
              {/* Left: conversations / new chat */}
              <div className={`flex w-72 shrink-0 flex-col border-r border-line ${paneActive ? "hidden sm:flex" : "flex"}`}>
                <div className="p-3">
                  <button
                    onClick={() => setShowNew((s) => !s)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5
                      text-sm font-medium text-accent-contrast hover:brightness-110"
                  >
                    {showNew ? <ArrowLeft size={16} /> : <Plus size={16} />}
                    {showNew ? t("common.back") : t("messaging.newChat")}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  {showNew ? (
                    <NewChatSearch
                      onSearch={ms.search}
                      onPick={(u) => {
                        ms.startWith(u);
                        setShowNew(false);
                      }}
                    />
                  ) : ms.conversations.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-muted">{t("messaging.empty")}</p>
                  ) : (
                    ms.conversations.map((conv) => (
                      <ConversationRow
                        key={conv.peerId}
                        conv={conv}
                        peer={ms.peers[conv.peerId]}
                        myId={ms.myId}
                        active={conv.peerId === ms.currentPeerId}
                        onClick={() => ms.open(conv.peerId)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Right: thread */}
              <div className={`min-h-0 flex-1 flex-col ${paneActive ? "flex" : "hidden sm:flex"}`}>
                {peer ? (
                  <>
                    <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
                      <button
                        onClick={ms.back}
                        aria-label={t("common.back")}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content sm:hidden"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <Avatar user={{ nickname: peerName(peer), avatarUrl: peer.avatar_url }} size={34} />
                      <span className="truncate text-sm font-medium">{peerName(peer)}</span>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col p-4">
                      <MessageThread
                        key={ms.currentPeerId}
                        messages={ms.currentMessages}
                        myId={ms.myId}
                        peer={peer}
                        onSend={ms.send}
                        autoFocus
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                    <MessagesSquare size={22} />
                    {t("messaging.selectConversation")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
