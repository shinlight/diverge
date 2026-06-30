import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LayoutDashboard, Users as UsersIcon, CreditCard, Receipt, Megaphone, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/auth/AuthContext";
import { isAdmin } from "../lib/admin/adminService";
import { useI18n } from "../lib/i18n/LanguageContext";
import Overview from "../components/admin/Overview";
import Users from "../components/admin/Users";
import Subscriptions from "../components/admin/Subscriptions";
import Payments from "../components/admin/Payments";
import Feedback from "../components/admin/Feedback";
import Access from "../components/admin/Access";

const SECTIONS = [
  { id: "overview", icon: LayoutDashboard, Comp: Overview },
  { id: "access", icon: KeyRound, Comp: Access },
  { id: "users", icon: UsersIcon, Comp: Users },
  { id: "subscriptions", icon: CreditCard, Comp: Subscriptions },
  { id: "payments", icon: Receipt, Comp: Payments },
  { id: "feedback", icon: Megaphone, Comp: Feedback },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [active, setActive] = useState("overview");

  if (loading) return null;
  if (!isAdmin(user)) return <Navigate to="/" replace />;

  const Active = SECTIONS.find((s) => s.id === active)?.Comp ?? Overview;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content" aria-label={t("admin.backToApp")}>
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-base font-semibold">
              Divergify <span className="text-muted">· {t("admin.console")}</span>
            </h1>
          </div>
          <span className="hidden text-sm text-muted sm:block">{user?.email}</span>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <nav className="hidden w-52 shrink-0 sm:block">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button onClick={() => setActive(s.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active === s.id ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2 hover:text-content"
                  }`}>
                  <s.icon size={16} /> {t(`admin.${s.id}`)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile section tabs */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-1 overflow-x-auto sm:hidden">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${active === s.id ? "bg-accent text-accent-contrast" : "bg-surface-2/50 text-muted"}`}>
                {t(`admin.${s.id}`)}
              </button>
            ))}
          </div>

          <Active />
        </div>
      </div>
    </div>
  );
}
