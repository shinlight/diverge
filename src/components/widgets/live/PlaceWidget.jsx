import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, Maximize2, Star, X } from "lucide-react";
import { usePlace } from "../../../lib/widgets/place/usePlace";
import { formatDistance } from "../../../lib/widgets/place/placeService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import PlaceFocus from "./PlaceFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#34a853";

export default function PlaceWidget({ title = "Find a Place", onRename }) {
  const { t } = useI18n();
  const place = usePlace();
  const { query, setQuery, results, status, recent } = place;
  const [focusOpen, setFocusOpen] = useState(false);

  const preview = results.slice(0, 3);

  function openPlace(id) {
    place.select(id);
    setFocusOpen(true);
  }

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={MapPin}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={t("place.subtitle")}
        actions={
          <button onClick={() => setFocusOpen(true)} aria-label={t("common.expand")}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
            <Maximize2 size={15} />
          </button>
        }
      />

      {/* Search box */}
      <div className="relative mb-2">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("place.searchPlaceholder")}
          className="w-full rounded-xl border border-line bg-surface-2/40 py-2 pl-9 pr-8 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label={t("common.clear")}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="min-h-[96px] flex-1">
        {status === "loading" ? (
          <CenteredState>
            <Loader2 size={18} className="animate-spin text-muted" />
          </CenteredState>
        ) : status === "empty" ? (
          <CenteredState>
            <span className="text-sm text-muted">{t("place.noResults")}</span>
          </CenteredState>
        ) : status === "idle" ? (
          <RecentOrHint recent={recent} onPick={setQuery} t={t} />
        ) : (
          <ul className="-mx-2 space-y-0.5">
            <AnimatePresence initial={false}>
              {preview.map((p, i) => (
                <motion.li key={p.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                  <button onClick={() => openPlace(p.id)} className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2/60">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                      <MapPin size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Star size={11} fill="#f5b400" color="#f5b400" />
                        <span>{p.rating.toLocaleString("it-IT")}</span>
                        <span>·</span>
                        <span className="truncate">{p.category}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{formatDistance(p.distance)}</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <PlaceFocus open={focusOpen} onClose={() => setFocusOpen(false)} place={place} />
    </div>
  );
}

function RecentOrHint({ recent, onPick, t }) {
  if (recent.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
        <MapPin size={20} />
        <span>{t("place.hint")}</span>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("place.recent")}</p>
      <div className="flex flex-wrap gap-1.5">
        {recent.map((q) => (
          <button key={q} onClick={() => onPick(q)}
            className="rounded-full border border-line bg-surface-2/40 px-2.5 py-1 text-xs text-content/90 transition-colors hover:bg-surface-2">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function CenteredState({ children }) {
  return <div className="flex h-full flex-col items-center justify-center gap-2 text-center">{children}</div>;
}
