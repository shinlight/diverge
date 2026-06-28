import { useState } from "react";
import { Smile, Maximize2, Zap } from "lucide-react";
import { useMood } from "../../../lib/widgets/mood/useMood";
import { MOODS, moodEmoji, relativeTime } from "../../../lib/widgets/mood/moodService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import MoodFocus from "./MoodFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#ec4899";

export default function MoodWidget({ title = "Mood & Energy", onRename }) {
  const { t, lang } = useI18n();
  const mood = useMood();
  const { latest, trend } = mood;
  const [focusOpen, setFocusOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={Smile}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={latest ? t("mood.lastCheck", { when: relativeTime(latest.ts, lang) }) : t("mood.subtitle")}
        actions={
          <button onClick={() => setFocusOpen(true)} aria-label={t("common.expand")}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
            <Maximize2 size={15} />
          </button>
        }
      />

      <div className="flex min-h-[140px] flex-1 flex-col">
        <p className="mb-2 text-sm text-muted">{t("mood.prompt")}</p>

        {/* Quick mood log */}
        <div className="flex items-center justify-between gap-1">
          {MOODS.map((m) => {
            const active = latest?.mood === m.v;
            return (
              <button key={m.v} onClick={() => mood.addEntry({ mood: m.v })}
                aria-label={`${t("mood.log")} ${m.v}/5`}
                className={`grid h-11 flex-1 place-items-center rounded-xl text-2xl transition-all hover:scale-110 ${active ? "" : "grayscale-[40%] hover:grayscale-0"}`}
                style={active ? { backgroundColor: `${ACCENT}1a` } : undefined}>
                {m.emoji}
              </button>
            );
          })}
        </div>

        {/* Latest + trend */}
        <div className="mt-auto pt-3">
          {latest && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="text-base">{moodEmoji(latest.mood)}</span>
              {latest.energy != null && (
                <span className="inline-flex items-center gap-0.5">
                  <Zap size={12} style={{ color: ACCENT }} /> {latest.energy}/5
                </span>
              )}
              <span className="ml-auto flex items-end gap-0.5">
                {trend.map((e, i) => (
                  <span key={i} className="w-1.5 rounded-full" style={{ height: `${4 + e.mood * 3}px`, backgroundColor: ACCENT, opacity: 0.4 + i * 0.08 }} />
                ))}
              </span>
            </div>
          )}
        </div>
      </div>

      <MoodFocus open={focusOpen} onClose={() => setFocusOpen(false)} mood={mood} />
    </div>
  );
}
