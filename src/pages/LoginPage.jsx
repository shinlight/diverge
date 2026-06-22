import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../lib/auth/AuthContext";
import { useI18n } from "../lib/i18n/LanguageContext";

// Inline brand glyphs (no extra dependency).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function LoginPage() {
  const { signInWithProvider, signInWithEmail, signUpWithEmail, loading } =
    useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [msg, setMsg] = useState(null); // { type: "error" | "info", text }
  const [busy, setBusy] = useState(false);
  const disabled = loading || busy;

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const res =
      mode === "signup"
        ? await signUpWithEmail(email, password, nickname)
        : await signInWithEmail(email, password);
    setBusy(false);
    if (res?.error) setMsg({ type: "error", text: res.error });
    else if (res?.info) setMsg({ type: "info", text: res.info });
  }

  async function oauth(provider) {
    setMsg(null);
    setBusy(true);
    const res = await signInWithProvider(provider);
    setBusy(false);
    if (res?.error) setMsg({ type: "error", text: res.error });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* soft ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2
          rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--color-accent)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={36} />
          <p className="mt-4 whitespace-pre-line text-sm text-muted">
            {t("login.tagline")}
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6">
          <div className="space-y-2.5">
            <Button
              variant="surface"
              size="lg"
              className="w-full"
              disabled={disabled}
              onClick={() => oauth("google")}
            >
              <GoogleIcon /> {t("login.continueGoogle")}
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> {t("login.or")}
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                required
                placeholder={t("login.nickname")}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface-2/40 px-4 py-3
                  text-sm outline-none placeholder:text-muted focus:border-accent"
              />
            )}
            <input
              type="email"
              required
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-2/40 px-4 py-3
                text-sm outline-none placeholder:text-muted focus:border-accent"
            />
            <input
              type="password"
              required
              placeholder={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-2/40 px-4 py-3
                text-sm outline-none placeholder:text-muted focus:border-accent"
            />
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={disabled}
            >
              {disabled ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Mail size={18} />
              )}
              {mode === "signup" ? t("login.createAccount") : t("login.signIn")}
            </Button>
          </form>

          {msg && (
            <p
              className={`mt-4 rounded-xl px-3 py-2 text-center text-sm ${
                msg.type === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {msg.text}
            </p>
          )}

          <p className="mt-5 text-center text-sm text-muted">
            {mode === "signup" ? t("login.haveAccount") : t("login.noAccount")}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-medium text-accent hover:underline"
            >
              {mode === "signup" ? t("login.signIn") : t("login.signUp")}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">
          {t("login.demo")}
        </p>
      </motion.div>
    </div>
  );
}
