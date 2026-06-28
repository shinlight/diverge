import { useEffect, useState } from "react";
import { Users, Activity, CircleDollarSign, TrendingUp, Crown, Megaphone } from "lucide-react";
import { getOverview, formatMoney } from "../../lib/admin/adminService";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { StatCard, SectionShell, MiniBars } from "./AdminUI";

export default function Overview() {
  const { t } = useI18n();
  const [d, setD] = useState(null);

  useEffect(() => {
    getOverview().then(setD);
  }, []);

  if (!d) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  return (
    <SectionShell title={t("admin.overview")} subtitle={t("admin.overviewSub")}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={Users} label={t("admin.totalUsers")} value={d.totalUsers} sub={t("admin.activeN", { n: d.activeUsers })} accent="#0ea5e9" />
        <StatCard icon={Crown} label={t("admin.proUsers")} value={d.proCount} sub={t("admin.freeN", { n: d.freeCount })} accent="#eab308" />
        <StatCard icon={CircleDollarSign} label="MRR" value={formatMoney(d.mrr)} sub={`ARR ${formatMoney(d.arr)}`} accent="#22c55e" />
        <StatCard icon={Activity} label={t("admin.activeUsers")} value={d.activeUsers} sub={t("admin.last7")} accent="#a855f7" />
        <StatCard icon={Megaphone} label={t("admin.openFeedback")} value={d.openFeedback} accent="#ef4444" />
        <StatCard icon={TrendingUp} label={t("admin.conversion")} value={`${Math.round((d.proCount / d.totalUsers) * 100)}%`} sub={t("admin.proShare")} accent="#ec4899" />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
        <p className="mb-3 text-sm font-medium">{t("admin.signups14")}</p>
        <MiniBars data={d.signups} accent="#7c5cff" />
      </div>
    </SectionShell>
  );
}
