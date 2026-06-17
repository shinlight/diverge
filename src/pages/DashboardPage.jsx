import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TopBar from "../components/layout/TopBar";
import WidgetGrid from "../components/widgets/WidgetGrid";
import AddWidgetSheet from "../components/widgets/AddWidgetSheet";
import ThemePanel from "../components/panels/ThemePanel";
import { useAuth } from "../lib/auth/AuthContext";
import { DEFAULT_LAYOUT } from "../lib/widgets/registry";

const LAYOUT_KEY = "diverge.layout";

function loadLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_LAYOUT;
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
  const [themeOpen, setThemeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  }, [layout]);

  const removeWidget = (id) => setLayout((l) => l.filter((w) => w !== id));
  const addWidget = (id) => {
    setLayout((l) => (l.includes(id) ? l : [...l, id]));
    setAddOpen(false);
  };

  return (
    <div className="min-h-screen">
      <TopBar onOpenTheme={() => setThemeOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting()}, {user?.nickname} 👋
          </h1>
          <p className="mt-1 text-muted">
            Ecco il tuo spazio. Trascina i widget per riordinarli.
          </p>
        </motion.div>

        <WidgetGrid
          layout={layout}
          onReorder={setLayout}
          onRemove={removeWidget}
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
