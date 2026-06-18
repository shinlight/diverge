import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { WIDGETS } from "../../lib/widgets/registry";
import { LIVE_WIDGETS } from "./live";
import WidgetHeader from "./WidgetHeader";

export default function WidgetCard({ id, titleOverride, onRemove, onRename }) {
  const widget = WIDGETS[id];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  if (!widget) return null;
  const Live = LIVE_WIDGETS[id];
  const title = titleOverride ?? widget.name;
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
      className={`group relative flex h-full flex-col rounded-2xl border border-line
        bg-surface transition-shadow ${
          isDragging ? "shadow-2xl shadow-black/40" : ""
        }`}
    >
      {/* Hover controls — float above the widget's own content. */}
      <div className="absolute right-3 top-3 z-20 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onRemove(id)}
          aria-label={`Rimuovi ${title}`}
          className="grid h-8 w-8 place-items-center rounded-lg bg-surface/80 text-muted
            backdrop-blur hover:bg-surface-2 hover:text-content"
        >
          <X size={16} />
        </button>
        <button
          {...attributes}
          {...listeners}
          aria-label={`Sposta ${title}`}
          className="grid h-8 w-8 cursor-grab place-items-center rounded-lg bg-surface/80
            text-muted backdrop-blur hover:bg-surface-2 hover:text-content active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {Live ? (
        <Live title={title} onRename={rename} />
      ) : (
        <PlaceholderBody widget={widget} title={title} onRename={rename} />
      )}
    </div>
  );
}

function PlaceholderBody({ widget, title, onRename }) {
  return (
    <div className="flex flex-col p-5">
      <WidgetHeader
        icon={widget.icon}
        iconColor={widget.accent}
        title={title}
        onRename={onRename}
      />
      <p className="text-sm leading-relaxed text-muted">{widget.description}</p>
      <div className="mt-4">
        <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
          In arrivo
        </span>
      </div>
    </div>
  );
}
