import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Settings2, Target } from "lucide-react";
import { useFocus } from "../../../lib/widgets/focus/useFocus";
import { formatTime } from "../../../lib/widgets/focus/focusService";
import FocusPanel from "./FocusPanel";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#e864c4";

const PHASE_TABS = [
  { key: "focus", label: "Focus" },
  { key: "short", label: "Pausa" },
  { key: "long", label: "Lunga" },
];

export default function FocusWidget({ title = "Focus", onRename }) {
  const focus = useFocus();
  const {
    phase,
    running,
    secondsLeft,
    pomodoroCount,
    currentTask,
    start,
    pause,
    reset,
    skip,
    selectPhase,
  } = focus;
  const [panel, setPanel] = useState({ open: false, tab: "tasks" });

  const isFocus = phase === "focus";

  return (
    <div className="flex h-full flex-col p-5">
      <WidgetHeader
        icon={Target}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={`🍅 ${pomodoroCount} oggi`}
        actions={
          <>
            <button
              onClick={() => setPanel({ open: true, tab: "settings" })}
              aria-label="Impostazioni"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted
                transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Settings2 size={16} />
            </button>
            <button
              onClick={() => setPanel({ open: true, tab: "tasks" })}
              aria-label="Espandi"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted
                transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Maximize2 size={15} />
            </button>
          </>
        }
      />

      {/* Phase tabs */}
      <div className="mb-3 flex gap-1 rounded-xl bg-surface-2/50 p-1">
        {PHASE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => selectPhase(t.key)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              phase === t.key
                ? "bg-surface text-content shadow-sm"
                : "text-muted hover:text-content"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          key={phase}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div
            className="font-semibold tabular-nums tracking-tight"
            style={{ fontSize: "3rem", lineHeight: 1.1, color: isFocus ? ACCENT : undefined }}
          >
            {formatTime(secondsLeft)}
          </div>
          <p className="mt-1 text-sm text-muted">
            {currentTask ? currentTask.title : "Nessun task selezionato"}
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={reset}
            aria-label="Reimposta"
            className="grid h-10 w-10 place-items-center rounded-full text-muted
              transition-colors hover:bg-surface-2 hover:text-content"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={running ? pause : start}
            aria-label={running ? "Pausa" : "Avvia"}
            className="grid h-14 w-14 place-items-center rounded-full text-white
              shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: ACCENT }}
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
          <button
            onClick={skip}
            aria-label="Salta"
            className="grid h-10 w-10 place-items-center rounded-full text-muted
              transition-colors hover:bg-surface-2 hover:text-content"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      <FocusPanel
        open={panel.open}
        initialTab={panel.tab}
        onClose={() => setPanel((p) => ({ ...p, open: false }))}
        focus={focus}
      />
    </div>
  );
}
