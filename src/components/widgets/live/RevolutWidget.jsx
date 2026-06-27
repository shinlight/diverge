import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  RefreshCw,
  Loader2,
  AlertCircle,
  Maximize2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { useRevolut } from "../../../lib/widgets/revolut/useRevolut";
import { relativeTime, formatMoney } from "../../../lib/widgets/revolut/revolutService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import RevolutFocus from "./RevolutFocus";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#0666eb";

export default function RevolutWidget({ title = "Revolut", onRename }) {
  const { t, lang } = useI18n();
  const revolut = useRevolut();
  const { connected, connecting, status, balance, currency, transactions } = revolut;
  const [focusOpen, setFocusOpen] = useState(false);

  const preview = transactions.slice(0, 4);

  return (
    <div className="flex min-h-full flex-col p-5">
      <WidgetHeader
        icon={Wallet}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={connected ? t("revolut.mainAccount") : t("revolut.notConnected")}
        actions={
          connected ? (
            <>
              <button onClick={revolut.refresh} disabled={status === "loading"} aria-label={t("common.refresh")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content disabled:opacity-50">
                <RefreshCw size={15} className={status === "loading" ? "animate-spin" : ""} />
              </button>
              <button onClick={() => setFocusOpen(true)} aria-label={t("common.expand")}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-content">
                <Maximize2 size={15} />
              </button>
            </>
          ) : null
        }
      />

      <div className="min-h-[140px] flex-1">
        {!connected ? (
          <ConnectPrompt onConnect={revolut.connect} connecting={connecting} t={t} />
        ) : status === "loading" && transactions.length === 0 ? (
          <CenteredState>
            <Loader2 size={20} className="animate-spin text-muted" />
            <span>{t("revolut.loading")}</span>
          </CenteredState>
        ) : status === "error" ? (
          <CenteredState>
            <AlertCircle size={20} className="text-muted" />
            <span>{t("common.error")}</span>
            <button onClick={revolut.refresh} className="mt-1 text-sm font-medium text-accent hover:underline">{t("common.retry")}</button>
          </CenteredState>
        ) : (
          <div className="flex h-full flex-col">
            {/* Balance */}
            <div className="mb-3">
              <p className="text-xs text-muted">{t("revolut.balance")}</p>
              <p className="text-2xl font-semibold tracking-tight">{formatMoney(balance, currency)}</p>
            </div>

            {/* Recent transactions */}
            <ul className="-mx-2 space-y-0.5">
              <AnimatePresence initial={false}>
                {preview.map((tx, i) => (
                  <motion.li key={tx.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                    <button onClick={() => setFocusOpen(true)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2/60">
                      <TxIcon income={tx.amount > 0} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-content/90">{tx.merchant}</span>
                        <span className="block truncate text-xs text-muted">{relativeTime(tx.date, lang)}</span>
                      </span>
                      <Amount tx={tx} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>

      <RevolutFocus open={focusOpen} onClose={() => setFocusOpen(false)} revolut={revolut} />
    </div>
  );
}

function TxIcon({ income }) {
  const Icon = income ? ArrowDownLeft : ArrowUpRight;
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
      style={
        income
          ? { backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }
          : { backgroundColor: "var(--color-surface-2)", color: "var(--color-muted)" }
      }
    >
      <Icon size={14} />
    </span>
  );
}

function Amount({ tx }) {
  const income = tx.amount > 0;
  return (
    <span className={`shrink-0 text-sm font-medium tabular-nums ${income ? "text-green-500" : "text-content"}`}>
      {formatMoney(tx.amount, tx.currency, { signed: true })}
    </span>
  );
}

function ConnectPrompt({ onConnect, connecting, t }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
        <Wallet size={22} />
      </span>
      <p className="whitespace-pre-line text-sm text-muted">{t("revolut.connectPrompt")}</p>
      <button onClick={onConnect} disabled={connecting}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
        style={{ backgroundColor: ACCENT }}>
        {connecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
        {connecting ? t("common.connecting") : t("revolut.connectCta")}
      </button>
    </div>
  );
}

function CenteredState({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
      {children}
    </div>
  );
}
