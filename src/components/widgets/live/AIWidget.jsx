import { useState } from "react";
import { Sparkles, Plus, Maximize2 } from "lucide-react";
import { useAI } from "../../../lib/widgets/ai/useAI";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import WidgetHeader from "../WidgetHeader";
import { ChatThread, ModelSelect } from "./aiChat";
import AIPanel from "./AIPanel";

const ACCENT = "#7c5cff";

export default function AIWidget({ instanceId, title, onRename }) {
  const { t } = useI18n();
  const ai = useAI(instanceId);
  const [panelOpen, setPanelOpen] = useState(false);

  const messages = ai.current?.messages ?? [];

  return (
    <div className="flex h-full flex-col p-5">
      <WidgetHeader
        icon={Sparkles}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        actions={
          <>
            <button
              onClick={ai.newChat}
              aria-label={t("ai.newChat")}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted
                transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setPanelOpen(true)}
              aria-label={t("common.expand")}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted
                transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Maximize2 size={15} />
            </button>
          </>
        }
      />

      <div className="mb-2.5 flex items-center justify-between gap-2">
        <ModelSelect model={ai.model} onSelect={ai.setModel} />
        {ai.conversations.length > 0 && (
          <button
            onClick={() => setPanelOpen(true)}
            className="text-xs text-muted hover:text-content"
          >
            {t("ai.chats", { n: ai.conversations.length })}
          </button>
        )}
      </div>

      <div className="flex h-56 min-h-0 flex-col">
        <ChatThread
          messages={messages}
          sending={ai.sending}
          onSend={ai.send}
          model={ai.model}
        />
      </div>

      <AIPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        ai={ai}
        title={title}
      />
    </div>
  );
}
