import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  CalendarPlus,
  Maximize2,
} from "lucide-react";
import { useCalendar } from "../../../lib/widgets/calendar/useCalendar";
import { timeRange, dayLabel } from "../../../lib/widgets/calendar/calendarService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import CalendarFocus from "./CalendarFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#4285f4";

export default function CalendarWidget({ title = "Calendar", onRename }) {
  const { t, lang } = useI18n();
  const calendar = useCalendar();
  const { connected, connecting, status, upcoming, connect } = calendar;
  const [focus, setFocus] = useState({
    open: false,
    selectedId: null,
    create: false,
  });

  const openFocus = (opts = {}) =>
    setFocus({
      open: true,
      selectedId: opts.selectedId ?? null,
      create: opts.create ?? false,
    });
  const closeFocus = () => setFocus((f) => ({ ...f, open: false }));

  const preview = upcoming.slice(0, 4);

  return (
    <div className="flex h-full flex-col p-5">
      <WidgetHeader
        icon={Calendar}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={
          connected
            ? upcoming.length > 0
              ? t("calendar.upcoming", { n: upcoming.length })
              : t("calendar.noEvents")
            : t("common.notConnected")
        }
        actions={
          connected ? (
            <>
              <button
                onClick={() => openFocus({ create: true })}
                aria-label={t("calendar.newEvent")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content"
              >
                <CalendarPlus size={16} />
              </button>
              <button
                onClick={calendar.refresh}
                disabled={status === "loading"}
                aria-label={t("common.refresh")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted
                  transition-colors hover:bg-surface-2 hover:text-content disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={status === "loading" ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => openFocus()}
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

      {/* Body */}
      <div className="min-h-[140px] flex-1">
        {!connected ? (
          <ConnectPrompt onConnect={connect} connecting={connecting} />
        ) : status === "loading" && upcoming.length === 0 ? (
          <CenteredState>
            <Loader2 size={20} className="animate-spin text-muted" />
            <span>{t("calendar.loading")}</span>
          </CenteredState>
        ) : status === "error" ? (
          <CenteredState>
            <AlertCircle size={20} className="text-muted" />
            <span>{t("common.error")}</span>
            <button
              onClick={calendar.refresh}
              className="mt-1 text-sm font-medium text-accent hover:underline"
            >
              {t("common.retry")}
            </button>
          </CenteredState>
        ) : preview.length === 0 ? (
          <CenteredState>
            <Calendar size={20} className="text-muted" />
            <span>{t("calendar.noUpcoming")}</span>
            <button
              onClick={() => openFocus({ create: true })}
              className="mt-1 text-sm font-medium text-accent hover:underline"
            >
              {t("calendar.createEvent")}
            </button>
          </CenteredState>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {preview.map((ev, i) => (
                <motion.li
                  key={ev.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => openFocus({ selectedId: ev.id })}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left
                      transition-colors hover:bg-surface-2/60"
                  >
                    <span
                      className="h-9 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: ev.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {ev.title}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {dayLabel(ev.start, lang)} · {timeRange(ev.start, ev.end, lang)}
                      </span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <CalendarFocus
        open={focus.open}
        onClose={closeFocus}
        calendar={calendar}
        initialSelectedId={focus.selectedId}
        initialCreate={focus.create}
      />
    </div>
  );
}

function ConnectPrompt({ onConnect, connecting }) {
  const { t } = useI18n();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="whitespace-pre-line text-sm text-muted">
        {t("calendar.connectPrompt")}
      </p>
      <button
        onClick={onConnect}
        disabled={connecting}
        data-testid="calendar-connect"
        className="inline-flex items-center gap-2 rounded-xl border border-line
          bg-surface-2/50 px-4 py-2.5 text-sm font-medium transition-colors
          hover:bg-surface-2 disabled:opacity-60"
      >
        {connecting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GoogleGlyph />
        )}
        {connecting ? t("common.connecting") : t("calendar.connect")}
      </button>
    </div>
  );
}

function CenteredState({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
      {children}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
