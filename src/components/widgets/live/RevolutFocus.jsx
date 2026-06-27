import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  X,
  RefreshCw,
  LogOut,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
} from "lucide-react";
import { relativeTime, fullDate, formatMoney } from "../../../lib/widgets/revolut/revolutService";
import { useI18n } from "../../../lib/i18n/LanguageContext";

const ACCENT = "#0666eb";

export default function RevolutFocus({ open, onClose, revolut }) {
  const { t, lang } = useI18n();
  const { status, balance, currency, pockets, transactions, refresh, disconnect } = revolut;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-3xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl">
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                <Wallet size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{t("widgets.revolut.name")}</h2>
                <p className="truncate text-xs text-muted">{t("revolut.mainAccount")}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={refresh} disabled={status === "loading"} aria-label={t("common.refresh")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content disabled:opacity-50">
                  <RefreshCw size={16} className={status === "loading" ? "animate-spin" : ""} />
                </button>
                <button onClick={disconnect}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                  <LogOut size={15} /> {t("revolut.disconnect")}
                </button>
                <button onClick={onClose} aria-label={t("common.close")}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* Balance + pockets */}
              <div className="border-b border-line px-6 py-5">
                <p className="text-xs text-muted">{t("revolut.balance")}</p>
                <p className="text-3xl font-semibold tracking-tight">{formatMoney(balance, currency)}</p>

                {pockets.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("revolut.pockets")}</p>
                    <div className="flex flex-wrap gap-2">
                      {pockets.map((p) => (
                        <div key={p.id} className="rounded-xl border border-line bg-surface-2/40 px-3 py-2">
                          <p className="text-[11px] font-medium text-muted">{p.currency}</p>
                          <p className="text-sm font-semibold tabular-nums">{formatMoney(p.balance, p.currency)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div className="px-3 py-2">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("revolut.transactions")}</p>
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted">
                    <Inbox size={20} /> {t("revolut.empty")}
                  </div>
                ) : (
                  <ul>
                    {transactions.map((tx) => (
                      <TxRow key={tx.id} tx={tx} lang={lang} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TxRow({ tx, lang }) {
  const income = tx.amount > 0;
  const Icon = income ? ArrowDownLeft : ArrowUpRight;
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/40">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={
          income
            ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }
            : { backgroundColor: "var(--color-surface-2)", color: "var(--color-muted)" }
        }
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tx.merchant}</p>
        <p className="truncate text-xs text-muted">{tx.category} · {fullDate(tx.date, lang)}</p>
      </div>
      <span className={`shrink-0 text-sm font-semibold tabular-nums ${income ? "text-green-500" : "text-content"}`}>
        {formatMoney(tx.amount, tx.currency, { signed: true })}
      </span>
    </li>
  );
}
