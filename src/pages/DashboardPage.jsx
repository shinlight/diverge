import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TopBar from "../components/layout/TopBar";
import WidgetGrid from "../components/widgets/WidgetGrid";
import AddWidgetSheet from "../components/widgets/AddWidgetSheet";
import ThemePanel from "../components/panels/ThemePanel";
import { useAuth } from "../lib/auth/AuthContext";
import { DEFAULT_LAYOUT } from "../lib/widgets/registry";

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

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Notte fonda";
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default function DashboardPage() {
  const { user } = useAuth();
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
  const addWidget = (id) => {
    setLayout((l) => (l.includes(id) ? l : [...l, id]));
    setAddOpen(false);
  };

  return (
    <div className="min-h-screen">
      <TopBar onOpenTheme={() => setThemeOpen(true)} />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-lg font-semibold tracking-tight">
            {greeting()}, {user?.nickname}
          </h1>
        </motion.div>

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
