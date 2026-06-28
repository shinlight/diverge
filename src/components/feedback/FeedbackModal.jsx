import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Lightbulb, X, Send, Check, Loader2 } from "lucide-react";
import { submitFeedback, captureContext } from "../../lib/feedback/feedbackService";
import { useAuth } from "../../lib/auth/AuthContext";
import { useI18n } from "../../lib/i18n/LanguageContext";

// A single shared modal. `target` is { widgetId, widgetName } or {} (general),
// or null when closed.
export default function FeedbackModal({ target, onClose }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const open = target !== null;

  const [type, setType] = useState("bug"); // bug | improvement
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent

  // Reset each time the modal opens.
  useEffect(() => {
    if (open) {
      setType("bug");
      setMessage("");
      setEmail(user?.email ?? "");
      setState("idle");
    }
  }, [open, user?.email]);

  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setState("sending");
    await submitFeedback({
      type,
      message: message.trim(),
      email: email.trim() || null,
      user_id: user?.id ?? null,
      ...captureContext(target || {}),
    });
    setState("sent");
    setTimeout(onClose, 1200);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{t("feedback.title")}</h2>
                <p className="truncate text-xs text-muted">
                  {target?.widgetName ? t("feedback.aboutWidget", { widget: target.widgetName }) : t("feedback.general")}
                </p>
              </div>
              <button onClick={onClose} aria-label={t("common.close")}
                className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-content">
                <X size={18} />
              </button>
            </div>

            {state === "sent" ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-green-500/15 text-green-500">
                  <Check size={24} />
                </span>
                <p className="text-sm font-medium">{t("feedback.thanks")}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 px-5 py-5">
                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <TypeButton active={type === "bug"} onClick={() => setType("bug")} icon={Bug} label={t("feedback.bug")} />
                  <TypeButton active={type === "improvement"} onClick={() => setType("improvement")} icon={Lightbulb} label={t("feedback.improvement")} />
                </div>

                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} autoFocus
                  placeholder={type === "bug" ? t("feedback.bugPlaceholder") : t("feedback.improvementPlaceholder")}
                  className="w-full resize-none rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent" />

                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("feedback.emailOptional")}
                  className="w-full rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent" />

                {target?.widgetName && (
                  <p className="text-xs text-muted">{t("feedback.contextNote", { widget: target.widgetName })}</p>
                )}

                <button type="submit" disabled={!message.trim() || state === "sending"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast transition-[filter] hover:brightness-110 disabled:opacity-50">
                  {state === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {t("feedback.send")}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypeButton({ active, onClick, icon: Icon, label }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "border-accent bg-accent/10 text-content" : "border-line text-muted hover:bg-surface-2"
      }`}>
      <Icon size={16} /> {label}
    </button>
  );
}
