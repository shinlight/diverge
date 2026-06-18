import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { WIDGETS, instanceType } from "../../lib/widgets/registry";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { LIVE_WIDGETS } from "./live";
import WidgetHeader from "./WidgetHeader";

export default function WidgetCard({ id, titleOverride, onRemove, onRename }) {
  const { t } = useI18n();
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
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line
        bg-surface transition-shadow ${
          isDragging ? "shadow-2xl shadow-black/40" : ""
        }`}
    >
      {/* Hover controls — float above the widget's own content. */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
        {Live ? (
          <Live instanceId={id} title={title} onRename={rename} />
        ) : (
          <PlaceholderBody widget={widget} title={title} desc={t(widget.descKey)} onRename={rename} />
        )}
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
