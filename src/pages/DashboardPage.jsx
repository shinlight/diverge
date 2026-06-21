import { useEffect, useState } from "react";
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

function loadLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_LAYOUT;
}

function loadTitles() {
  try {
    const raw = localStorage.getItem(TITLES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export default function DashboardPage() {
  const [layout, setLayout] = useState(loadLayout);
  const [titles, setTitles] = useState(loadTitles);
  const [themeOpen, setThemeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    localStorage.setItem(TITLES_KEY, JSON.stringify(titles));
  }, [titles]);

  const renameWidget = (id, title) =>
    setTitles((t) => ({ ...t, [id]: title }));

  const removeWidget = (id) => setLayout((l) => l.filter((w) => w !== id));

  // type = the widget kind chosen in the picker. Multi-instance types (AI)
  // get a fresh unique instance id so several can coexist.
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
          layout={layout}
          titles={titles}
          onReorder={setLayout}
          onRemove={removeWidget}
          onRename={renameWidget}
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
