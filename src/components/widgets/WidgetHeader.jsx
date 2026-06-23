import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useTheme } from "../../lib/theme/ThemeContext";

/*
  Shared header for every widget (live and placeholder).
  Shows: icon + editable title (+ optional badge) + optional subtitle + actions.
  The title is renamed inline; onRename persists the user's custom name.

  The right padding keeps the title + actions clear of the card's floating
  controls (drag / remove / pin / widen — up to 4 on hover).
*/
export default function WidgetHeader({
  icon: Icon,
  iconColor,
  title,
  onRename,
  subtitle,
  badge,
  actions,
}) {
  const { mono } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setDraft(title);
      inputRef.current?.select();
    }
  }, [editing, title]);

  function commit() {
    const next = draft.trim();
    if (next && next !== title) onRename?.(next);
    setEditing(false);
  }

  return (
    <div className="mb-3 flex items-start gap-2.5 pr-28 sm:pr-[8.5rem]">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: mono ? "rgba(255,255,255,0.1)" : `${iconColor}1a`,
          color: mono ? "#ffffff" : iconColor,
        }}
      >
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-full rounded-md border border-line bg-surface-2/60 px-1.5 py-0.5
              text-base font-semibold outline-none focus:border-accent"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold">{title}</h3>
            {badge}
            {onRename && (
              <button
                onClick={() => setEditing(true)}
                aria-label="Rinomina widget"
                className="shrink-0 text-muted opacity-0 transition-opacity
                  hover:text-content group-hover:opacity-100"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        )}
        {subtitle && (
          <p className="truncate text-xs text-muted">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="hidden items-center gap-1 group-hover:flex">{actions}</div>
      )}
    </div>
  );
}
