import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Pin, ChevronsLeftRight, ChevronsRightLeft, Megaphone } from "lucide-react";
import { WIDGETS, instanceType } from "../../lib/widgets/registry";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { useFeedback } from "../../lib/feedback/FeedbackContext";
import { LIVE_WIDGETS } from "./live";
import WidgetHeader from "./WidgetHeader";
import ErrorBoundary from "../ui/ErrorBoundary";

export default function WidgetCard({
  id,
  titleOverride,
  pinned = false,
  pinDisabled = false,
  wide = false,
  onRemove,
  onRename,
  onTogglePin,
  onToggleWide,
}) {
  const { t } = useI18n();
  const { open: openFeedback } = useFeedback();
  const type = instanceType(id);
  const widget = WIDGETS[type];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  if (!widget) return null;
  const Live = LIVE_WIDGETS[type];
  const title = titleOverride ?? t(widget.nameKey);
  const rename = (next) => onRename?.(id, next);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border
        bg-surface transition-shadow ${
          pinned ? "border-accent/50 ring-1 ring-accent/30" : "border-line"
        } ${isDragging ? "shadow-2xl shadow-black/40" : ""}`}
    >
      {/* Persistent pin badge (so you see what's pinned without hovering). */}
      {pinned && (
        <span
          className="absolute left-2 top-2 z-20 grid h-6 w-6 place-items-center rounded-lg
            bg-accent/15 text-accent"
          aria-hidden="true"
          title={t("widget.pinned")}
        >
          <Pin size={13} fill="currentColor" />
        </span>
      )}

      {/* Hover controls — float above the widget's own content. */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => openFeedback({ widgetId: type, widgetName: title })}
          aria-label={t("feedback.report")}
          title={t("feedback.report")}
          className="grid h-7 w-7 place-items-center rounded-lg bg-surface/80 text-muted
            backdrop-blur hover:bg-surface-2 hover:text-content"
        >
          <Megaphone size={15} />
        </button>
        {widget.wide && (
          <button
            onClick={() => onToggleWide?.(id)}
            aria-label={wide ? t("widget.shrink") : t("widget.widen")}
            title={wide ? t("widget.shrink") : t("widget.widen")}
            className="hidden h-7 w-7 place-items-center rounded-lg bg-surface/80 text-muted
              backdrop-blur hover:bg-surface-2 hover:text-content sm:grid"
          >
            {wide ? <ChevronsRightLeft size={15} /> : <ChevronsLeftRight size={15} />}
          </button>
        )}
        <button
          onClick={() => !pinDisabled && onTogglePin?.(id)}
          disabled={pinDisabled}
          aria-label={pinned ? t("widget.unpin") : t("widget.pin")}
          title={pinDisabled ? t("widget.pinFull") : pinned ? t("widget.unpin") : t("widget.pin")}
          className={`grid h-7 w-7 place-items-center rounded-lg bg-surface/80 backdrop-blur
            hover:bg-surface-2 hover:text-content disabled:opacity-40
            ${pinned ? "text-accent" : "text-muted"}`}
        >
          <Pin size={15} fill={pinned ? "currentColor" : "none"} />
        </button>
        <button
          onClick={() => onRemove(id)}
          aria-label={`Rimuovi ${title}`}
          className="grid h-7 w-7 place-items-center rounded-lg bg-surface/80 text-muted
            backdrop-blur hover:bg-surface-2 hover:text-content"
        >
          <X size={15} />
        </button>
        <button
          {...attributes}
          {...listeners}
          aria-label={`Sposta ${title}`}
          className="grid h-7 w-7 cursor-grab place-items-center rounded-lg bg-surface/80
            text-muted backdrop-blur hover:bg-surface-2 hover:text-content active:cursor-grabbing"
        >
          <GripVertical size={15} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ErrorBoundary label={title} retryLabel={t("common.retry")}>
          {Live ? (
            <Live instanceId={id} title={title} onRename={rename} />
          ) : (
            <PlaceholderBody widget={widget} title={title} desc={t(widget.descKey)} onRename={rename} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

function PlaceholderBody({ widget, title, desc, onRename }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={widget.icon}
        iconColor={widget.accent}
        title={title}
        onRename={onRename}
      />
      <p className="text-sm leading-relaxed text-muted">{desc}</p>
      <div className="mt-4">
        <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
          {t("common.soon")}
        </span>
      </div>
    </div>
  );
}
