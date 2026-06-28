import { useState } from "react";
import { Bug, Lightbulb, Inbox } from "lucide-react";
import { loadFeedback, updateFeedbackStatus } from "../../lib/feedback/feedbackService";
import { formatDate } from "../../lib/admin/adminService";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { Badge, SectionShell } from "./AdminUI";

const STATUS_TONE = { new: "accent", triaged: "amber", done: "green", wontfix: "gray" };
const NEXT = { new: "triaged", triaged: "done", done: "new", wontfix: "new" };

export default function Feedback() {
  const { t } = useI18n();
  const [items, setItems] = useState(() => loadFeedback());
  const [filter, setFilter] = useState("all"); // all | bug | improvement

  const filtered = filter === "all" ? items : items.filter((f) => f.type === filter);

  const cycle = (id) => {
    const cur = items.find((f) => f.id === id);
    setItems(updateFeedbackStatus(id, NEXT[cur.status] || "new"));
  };

  return (
    <SectionShell
      title={t("admin.feedback")}
      subtitle={t("admin.feedbackN", { n: items.filter((f) => f.status === "new").length })}
      actions={
        <div className="flex gap-1 rounded-xl border border-line bg-surface-2/40 p-1">
          {["all", "bug", "improvement"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-accent text-accent-contrast" : "text-muted hover:text-content"}`}>
              {f === "all" ? t("dopamine.energy.all") : t(`feedback.${f}`)}
            </button>
          ))}
        </div>
      }
    >
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-16 text-sm text-muted">
          <Inbox size={22} /> {t("admin.feedbackEmpty")}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((f) => (
            <li key={f.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${f.type === "bug" ? "bg-red-500/12 text-red-400" : "bg-amber-500/12 text-amber-500"}`}>
                  {f.type === "bug" ? <Bug size={16} /> : <Lightbulb size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-content/90">{f.message}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    {f.widget && <span>📍 {f.widget}</span>}
                    {f.email && <span>{f.email}</span>}
                    <span>{formatDate(f.created_at, true)}</span>
                  </div>
                </div>
                <button onClick={() => cycle(f.id)} title={t("admin.cycleStatus")}>
                  <Badge tone={STATUS_TONE[f.status] || "gray"}>{t(`admin.fb_${f.status}`)}</Badge>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
