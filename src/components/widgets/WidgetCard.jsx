import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { WIDGETS } from "../../lib/widgets/registry";
import { LIVE_WIDGETS } from "./live";

export default function WidgetCard({ id, onRemove }) {
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
          aria-label={`Rimuovi ${widget.name}`}
          className="grid h-8 w-8 place-items-center rounded-lg bg-surface/80 text-muted
            backdrop-blur hover:bg-surface-2 hover:text-content"
        >
          <X size={16} />
        </button>
        <button
          {...attributes}
          {...listeners}
          aria-label={`Sposta ${widget.name}`}
          className="grid h-8 w-8 cursor-grab place-items-center rounded-lg bg-surface/80
            text-muted backdrop-blur hover:bg-surface-2 hover:text-content active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {Live ? <Live /> : <PlaceholderBody widget={widget} />}
    </div>
  );
}

function PlaceholderBody({ widget }) {
  const Icon = widget.icon;
  return (
    <div className="flex flex-col p-5">
      <div
        className="mb-3 grid h-11 w-11 place-items-center rounded-xl"
        style={{ backgroundColor: `${widget.accent}1a`, color: widget.accent }}
      >
        <Icon size={22} />
      </div>
      <h3 className="text-base font-semibold">{widget.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {widget.description}
      </p>
      <div className="mt-4">
        <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
          In arrivo
        </span>
      </div>
    </div>
  );
}
