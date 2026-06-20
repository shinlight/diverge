import { useState } from "react";
import { MessageCircle, Plus, Maximize2, Loader2, Users } from "lucide-react";
import { useMessaging } from "../../../lib/widgets/messaging/useMessaging";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import WidgetHeader from "../WidgetHeader";
import { ChannelSelect, ChannelStatus, ConversationRow } from "./msgChat";
import MessagingPanel from "./MessagingPanel";

const ACCENT = "#0ea5e9";

export default function MessagingWidget({ instanceId, title, onRename }) {
  const { t } = useI18n();
  const ms = useMessaging(instanceId);
  const [panel, setPanel] = useState({ open: false, newChat: false });

  const openConversation = (peerId) => {
    ms.open(peerId);
    setPanel({ open: true, newChat: false });
  };
  const openNew = () => setPanel({ open: true, newChat: true });

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={MessageCircle}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        badge={
          ms.channel === "internal" && ms.unreadTotal > 0 ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-contrast">
              {ms.unreadTotal}
            </span>
          ) : null
        }
        actions={
          ms.channel === "internal" ? (
            <>
              <button
                onClick={openNew}
                aria-label={t("messaging.newChat")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setPanel({ open: true, newChat: false })}
                aria-label={t("common.expand")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content"
              >
                <Maximize2 size={15} />
              </button>
            </>
          ) : null
        }
      />

      <div className="mb-2.5">
        <ChannelSelect channel={ms.channel} onSelect={ms.selectChannel} />
      </div>

      <div className="min-h-0 flex-1">
        {ms.channel !== "internal" ? (
          <ChannelStatus channel={ms.channel} />
        ) : ms.loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={20} className="animate-spin text-muted" />
          </div>
        ) : ms.conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Users size={20} className="text-muted" />
            <p className="text-sm text-muted">{t("messaging.empty")}</p>
            <button
              onClick={openNew}
              className="text-sm font-medium text-accent hover:underline"
            >
              {t("messaging.newChat")}
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {ms.conversations.map((conv) => (
              <ConversationRow
                key={conv.peerId}
                conv={conv}
                peer={ms.peers[conv.peerId]}
                myId={ms.myId}
                active={false}
                onClick={() => openConversation(conv.peerId)}
              />
            ))}
          </div>
        )}
      </div>

      <MessagingPanel
        open={panel.open}
        initialNew={panel.newChat}
        onClose={() => setPanel((p) => ({ ...p, open: false }))}
        ms={ms}
        title={title}
      />
    </div>
  );
}
