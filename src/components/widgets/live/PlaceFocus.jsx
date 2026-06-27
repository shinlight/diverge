import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  X,
  Star,
  Loader2,
  Clock,
  Phone,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { mapsUrl, formatDistance } from "../../../lib/widgets/place/placeService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#34a853";

export default function PlaceFocus({ open, onClose, place }) {
  const { t } = useI18n();
  const { query, setQuery, results, status, selected, selectedId, select } = place;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <MapPin size={18} />
              </span>
              <h2 className="min-w-0 truncate text-base font-semibold">{t("widgets.place.name")}</h2>
              <button onClick={onClose} aria-label={t("common.close")}
                className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                <X size={18} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1">
              {/* Left: search + results */}
              <div className={`flex w-full shrink-0 flex-col border-r border-line sm:w-[340px] ${selected ? "hidden sm:flex" : "flex"}`}>
                <div className="shrink-0 p-4">
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("place.searchPlaceholder")}
                      className="w-full rounded-xl border border-line bg-surface-2/40 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent"
                    />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                  {status === "loading" ? (
                    <div className="flex h-full items-center justify-center"><Loader2 size={20} className="animate-spin text-muted" /></div>
                  ) : status === "idle" ? (
                    <p className="px-3 py-6 text-center text-sm text-muted">{t("place.hint")}</p>
                  ) : status === "empty" ? (
                    <p className="px-3 py-6 text-center text-sm text-muted">{t("place.noResults")}</p>
                  ) : (
                    <ul>
                      {results.map((p) => (
                        <ResultRow key={p.id} place={p} active={p.id === selectedId} onClick={() => select(p.id)} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right: detail */}
              <div className={`min-h-0 flex-1 overflow-y-auto ${selected ? "block" : "hidden sm:block"}`}>
                {selected ? (
                  <PlaceDetail place={selected} onBack={() => select(null)} t={t} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
                    <MapPin size={22} /> {t("place.selectHint")}
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

function ResultRow({ place, active, onClick }) {
  return (
    <li>
      <button onClick={onClick}
        className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${active ? "bg-surface-2/70" : "hover:bg-surface-2/40"}`}>
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
          <MapPin size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{place.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Star size={11} fill="#f5b400" color="#f5b400" />
            <span>{place.rating.toLocaleString("it-IT")}</span>
            <span>·</span>
            <span className="truncate">{place.category}</span>
          </span>
          <span className="block truncate text-xs text-muted">{place.address}</span>
        </span>
        <span className="shrink-0 text-xs text-muted">{formatDistance(place.distance)}</span>
      </button>
    </li>
  );
}

function PlaceDetail({ place, onBack, t }) {
  return (
    <div className="flex h-full flex-col">
      {/* Map preview placeholder (real mode → Maps Embed iframe) */}
      <div className="relative h-44 shrink-0 overflow-hidden border-b border-line sm:h-56"
        style={{
          backgroundColor: "var(--color-surface-2)",
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}>
        <button onClick={onBack} aria-label={t("common.back")}
          className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-surface/80 text-muted backdrop-blur hover:text-content sm:hidden">
          <Navigation size={16} className="rotate-180" />
        </button>
        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full text-white shadow-lg" style={{ backgroundColor: ACCENT }}>
            <MapPin size={24} />
          </span>
          <span className="text-xs text-muted">{t("place.mapPreview")}</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h1 className="text-xl font-semibold">{place.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Star size={14} fill="#f5b400" color="#f5b400" />
            <span className="font-medium text-content">{place.rating.toLocaleString("it-IT")}</span>
            <span>({place.reviews.toLocaleString("it-IT")})</span>
          </span>
          <span>·</span>
          <span>{place.category}</span>
          <span>·</span>
          <span>{formatDistance(place.distance)}</span>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <Row icon={MapPin}><span>{place.address}</span></Row>
          <Row icon={Clock}>
            <span className={place.openNow ? "font-medium text-green-500" : "font-medium text-red-400"}>
              {place.openNow ? t("place.openNow") : t("place.closedNow")}
            </span>
          </Row>
          {place.phone && (
            <Row icon={Phone}><a href={`tel:${place.phone}`} className="hover:text-accent">{place.phone}</a></Row>
          )}
        </dl>

        <a href={mapsUrl(place)} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
          style={{ backgroundColor: ACCENT }}>
          <ExternalLink size={16} /> {t("place.openInMaps")}
        </a>
      </div>
    </div>
  );
}

function Row({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-muted" />
      <div className="min-w-0 text-content/90">{children}</div>
    </div>
  );
}
