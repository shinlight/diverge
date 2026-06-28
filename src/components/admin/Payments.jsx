import { useEffect, useMemo, useState } from "react";
import { CreditCard, Bitcoin } from "lucide-react";
import { getPayments, formatMoney, formatDate } from "../../lib/admin/adminService";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { Badge, SectionShell } from "./AdminUI";

const STATUS_TONE = {
  succeeded: "green",
  pending: "amber",
  refunded: "gray",
  failed: "red",
};

export default function Payments() {
  const { t } = useI18n();
  const [payments, setPayments] = useState(null);
  const [filter, setFilter] = useState("all"); // all | card | crypto

  useEffect(() => {
    getPayments().then(setPayments);
  }, []);

  const filtered = useMemo(() => {
    if (!payments) return [];
    return filter === "all" ? payments : payments.filter((p) => p.method.type === filter);
  }, [payments, filter]);

  if (!payments) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  const collected = payments
    .filter((p) => p.status === "succeeded" && ["EUR", "USDC"].includes(p.currency))
    .reduce((s, p) => s + p.amount, 0);

  return (
    <SectionShell
      title={t("admin.payments")}
      subtitle={t("admin.collected", { amount: formatMoney(collected) })}
      actions={
        <div className="flex gap-1 rounded-xl border border-line bg-surface-2/40 p-1">
          {["all", "card", "crypto"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-accent text-accent-contrast" : "text-muted hover:text-content"}`}>
              {t(`admin.method_${f}`)}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.invoice")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.user")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.amount")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.method")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">{t("admin.date")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line/50 last:border-0 hover:bg-surface-2/30">
                <td className="px-4 py-3 font-mono text-xs text-muted">{p.invoice}</td>
                <td className="px-4 py-3 font-medium">{p.user}</td>
                <td className="px-4 py-3 tabular-nums">{formatMoney(p.amount, p.currency)}</td>
                <td className="px-4 py-3">
                  {p.method.type === "crypto" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Bitcoin size={14} className="text-amber-500" />
                      <span>{p.method.asset}</span>
                      <span className="font-mono text-xs text-muted">{p.method.tx}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard size={14} className="text-muted" />
                      <span>{p.method.brand}</span>
                      <span className="text-xs text-muted">•••• {p.method.last4}</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3"><Badge tone={STATUS_TONE[p.status]}>{t(`admin.pay_${p.status}`)}</Badge></td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">{formatDate(p.createdAt, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
