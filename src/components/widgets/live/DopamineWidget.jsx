import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Maximize2, Shuffle, Check, Clock } from "lucide-react";
import { useDopamine } from "../../../lib/widgets/dopamine/useDopamine";
import { ENERGY_LEVELS } from "../../../lib/widgets/dopamine/dopamineService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import DopamineFocus from "./DopamineFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#eab308";

export default function DopamineWidget({ title = "Dopamine Menu", onRename }) {
  const { t } = useI18n();
  const dopamine = useDopamine();
  const { suggestion, filter, doneToday } = dopamine;
  const [focusOpen, setFocusOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={Zap}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={doneToday > 0 ? t("dopamine.doneToday", { n: doneToday }) : t("dopamine.subtitle")}
        actions={
          <button onClick={() => setFocusOpen(true)} aria-label={t("common.expand")}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
            <Maximize2 size={15} />
          </button>
        }
      />

      {/* Energy filter */}
      <div className="mb-2 flex gap-1">
        {["all", ...ENERGY_LEVELS].map((lvl) => (
          <button key={lvl} onClick={() => dopamine.shuffle(lvl)}
            className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${filter === lvl ? "text-white" : "text-muted hover:bg-surface-2"}`}
            style={filter === lvl ? { backgroundColor: ACCENT } : undefined}>
            {t(`dopamine.energy.${lvl}`)}
          </button>
        ))}
      </div>

      {/* Suggestion */}
      <div className="flex min-h-[96px] flex-1 flex-col">
        <AnimatePresence mode="wait">
          {suggestion ? (
            <motion.div key={suggestion.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}
              className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-surface-2/30 px-3 py-3 text-center">
              <span className="text-4xl">{suggestion.emoji}</span>
              <span className="text-sm font-medium">{suggestion.label}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Clock size={11} /> {t("dopamine.minutes", { n: suggestion.minutes })}
              </span>
            </motion.div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted">{t("dopamine.none")}</div>
          )}
        </AnimatePresence>

        <div className="mt-2 flex gap-2">
          <button onClick={() => dopamine.shuffle()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-2/50 px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2">
            <Shuffle size={15} /> {t("dopamine.shuffle")}
          </button>
          <button onClick={dopamine.markDone} disabled={!suggestion} aria-label={t("dopamine.markDone")}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}>
            <Check size={15} /> {t("dopamine.done")}
          </button>
        </div>
      </div>

      <DopamineFocus open={focusOpen} onClose={() => setFocusOpen(false)} dopamine={dopamine} />
    </div>
  );
}
