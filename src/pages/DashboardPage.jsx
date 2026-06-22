import { useEffect, useMemo, useState } from "react";
import TopBar from "../components/layout/TopBar";
import Cockpit from "../components/cockpit/Cockpit";
import WidgetGrid from "../components/widgets/WidgetGrid";
import AddWidgetSheet from "../components/widgets/AddWidgetSheet";
import ThemePanel from "../components/panels/ThemePanel";
import {
  DEFAULT_LAYOUT,
  isMultiInstance,
  newInstanceId,
} from "../lib/widgets/registry";

const LAYOUT_KEY = "diverge.layout";
const TITLES_KEY = "diverge.titles";
const PINNED_KEY = "diverge.pinned";
const MAX_PINNED = 6;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return fallback;
}

export default function DashboardPage() {
  const [layout, setLayout] = useState(() => loadJSON(LAYOUT_KEY, DEFAULT_LAYOUT));
  const [titles, setTitles] = useState(() => loadJSON(TITLES_KEY, {}));
  const [pinned, setPinned] = useState(() => loadJSON(PINNED_KEY, []));
  const [themeOpen, setThemeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)), [layout]);
  useEffect(() => localStorage.setItem(TITLES_KEY, JSON.stringify(titles)), [titles]);
  useEffect(() => localStorage.setItem(PINNED_KEY, JSON.stringify(pinned)), [pinned]);

  // Pinned widgets (in pin order) lead, then the rest in their own order.
  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);
  const order = useMemo(() => {
    const pins = pinned.filter((id) => layout.includes(id));
    const rest = layout.filter((id) => !pinnedSet.has(id));
    return [...pins, ...rest];
  }, [layout, pinned, pinnedSet]);

  const renameWidget = (id, title) => setTitles((t) => ({ ...t, [id]: title }));

  const removeWidget = (id) => {
    setLayout((l) => l.filter((w) => w !== id));
    setPinned((p) => p.filter((w) => w !== id));
  };

  const togglePin = (id) =>
    setPinned((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= MAX_PINNED) return p; // cap
      return [id, ...p]; // newest pin goes first
    });

  // Drag reorders the displayed order; split it back into pinned + layout.
  const reorder = (newOrder) => {
    setPinned((p) => newOrder.filter((id) => p.includes(id)));
    setLayout(newOrder);
  };

  const addWidget = (type) => {
    setLayout((l) => {
      if (isMultiInstance(type)) return [...l, newInstanceId(type)];
      return l.includes(type) ? l : [...l, type];
    });
    setAddOpen(false);
  };

  return (
    <div className="min-h-screen">
      <TopBar onOpenTheme={() => setThemeOpen(true)} />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <Cockpit />
        <WidgetGrid
          order={order}
          titles={titles}
          pinnedSet={pinnedSet}
          canPin={pinned.length < MAX_PINNED}
          onReorder={reorder}
          onRemove={removeWidget}
          onRename={renameWidget}
          onTogglePin={togglePin}
          onAdd={() => setAddOpen(true)}
        />
      </main>

      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
      <AddWidgetSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        layout={layout}
        onAdd={addWidget}
      />
    </div>
  );
}
