import { useEffect, useMemo, useState } from "react";
import { Search, Shield, Ban, CheckCircle2 } from "lucide-react";
import { getUsers, formatDate } from "../../lib/admin/adminService";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { Badge, SectionShell } from "./AdminUI";

export default function Users() {
  const { t } = useI18n();
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const s = q.trim().toLowerCase();
    return s ? users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(s)) : users;
  }, [users, q]);

  // Mock actions: update local state only.
  const toggleStatus = (id) =>
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u)));
  const toggleAdmin = (id) =>
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, isAdmin: !u.isAdmin } : u)));

  if (!users) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  return (
    <SectionShell
      title={t("admin.users")}
      subtitle={t("admin.usersN", { n: users.length })}
      actions={
        <div className="relative w-56">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.search")}
            className="w-full rounded-xl border border-line bg-surface-2/40 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent" />
        </div>
      }
    >
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.user")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.plan")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t("admin.joined")}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t("admin.lastSeen")}</th>
              <th className="px-4 py-3 text-right font-medium">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-line/50 last:border-0 hover:bg-surface-2/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-medium">
                    {u.name}
                    {u.isAdmin && <Shield size={13} className="text-accent" />}
                  </div>
                  <div className="text-xs text-muted">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.plan === "pro" ? "accent" : "gray"}>{u.plan === "pro" ? "Pro" : "Free"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.status === "active" ? "green" : u.status === "past_due" ? "amber" : "red"}>
                    {t(`admin.status_${u.status}`)}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDate(u.createdAt)}</td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDate(u.lastSeen, true)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleAdmin(u.id)} title={t("admin.toggleAdmin")}
                      className={`grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 ${u.isAdmin ? "text-accent" : "text-muted"}`}>
                      <Shield size={15} />
                    </button>
                    <button onClick={() => toggleStatus(u.id)} title={u.status === "suspended" ? t("admin.activate") : t("admin.suspend")}
                      className={`grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2 ${u.status === "suspended" ? "text-green-500" : "text-muted hover:text-red-400"}`}>
                      {u.status === "suspended" ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
