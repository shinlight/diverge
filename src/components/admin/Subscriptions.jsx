import { useEffect, useState } from "react";
import { CreditCard, Bitcoin } from "lucide-react";
import { getSubscriptions, formatMoney, formatDate } from "../../lib/admin/adminService";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { Badge, SectionShell } from "./AdminUI";

export default function Subscriptions() {
  const { t } = useI18n();
  const [subs, setSubs] = useState(null);

  useEffect(() => {
    getSubscriptions().then(setSubs);
  }, []);

  if (!subs) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  const active = subs.filter((s) => s.status === "active").length;
  const pastDue = subs.filter((s) => s.status === "past_due").length;

  return (
    <SectionShell title={t("admin.subscriptions")} subtitle={t("admin.subsSummary", { active, pastDue })}>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.user")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.plan")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.amount")}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t("admin.method")}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t("admin.renews")}</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-line/50 last:border-0 hover:bg-surface-2/30">
                <td className="px-4 py-3 font-medium">{s.user}</td>
                <td className="px-4 py-3"><Badge tone="accent">{s.plan}</Badge></td>
                <td className="px-4 py-3">
                  <Badge tone={s.status === "active" ? "green" : "amber"}>{t(`admin.status_${s.status}`)}</Badge>
                </td>
                <td className="px-4 py-3">{formatMoney(s.amount)}<span className="text-muted">/{t("admin.mo")}</span></td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    {s.method === "crypto" ? <Bitcoin size={14} /> : <CreditCard size={14} />}
                    {s.method === "crypto" ? "Crypto" : t("admin.card")}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDate(s.renewsAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
