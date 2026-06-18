import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, LogOut, Check } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import ThemePanel from "../components/panels/ThemePanel";
import { useAuth } from "../lib/auth/AuthContext";
import { useI18n } from "../lib/i18n/LanguageContext";
import { PLANS, PAYMENT_METHODS, startCheckout } from "../lib/payments/plans";

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState(user?.name ?? "");
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [saved, setSaved] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const fileRef = useRef(null);

  const displayMode = user?.displayMode ?? "nickname";

  function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile({ avatarUrl: reader.result });
    reader.readAsDataURL(file); // local preview; Phase 2 -> Supabase Storage
  }

  function saveIdentity() {
    updateProfile({
      name: name.trim() || user?.name,
      nickname: nickname.trim() || user?.nickname,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="min-h-screen">
      <TopBar onOpenTheme={() => setThemeOpen(true)} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-content"
        >
          <ArrowLeft size={16} /> {t("profile.back")}
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
        >
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
            <div className="relative">
              <Avatar user={user} size={88} />
              <button
                onClick={() => fileRef.current?.click()}
                aria-label={t("profile.changeImage")}
                className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center
                  rounded-full bg-accent text-accent-contrast ring-4 ring-surface
                  transition-transform hover:scale-105"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="hidden"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-muted">{user?.email}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium capitalize text-muted">
                {t("profile.plan", { plan: user?.plan })}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">
                {t("profile.name")}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("profile.namePlaceholder")}
                className="w-full rounded-xl border border-line bg-surface-2/40 px-4 py-3
                  text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted">
                {t("profile.nickname")}
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("profile.nicknamePlaceholder")}
                className="w-full rounded-xl border border-line bg-surface-2/40 px-4 py-3
                  text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-muted">
              {t("profile.showInBar")}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-line bg-surface-2/40 p-1">
                {[
                  { id: "nickname", labelKey: "profile.nickname" },
                  { id: "name", labelKey: "profile.name" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateProfile({ displayMode: opt.id })}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      displayMode === opt.id
                        ? "bg-accent text-accent-contrast"
                        : "text-muted hover:text-content"
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
              <Button variant="accent" className="ml-auto" onClick={saveIdentity}>
                {saved ? <Check size={18} /> : t("common.save")}
              </Button>
            </div>
          </div>
        </motion.section>

        {/* SaaS predisposition */}
        <section className="mt-8">
          <h2 className="mb-1 text-lg font-semibold">{t("profile.subscription")}</h2>
          <p className="mb-4 text-sm text-muted">{t("profile.subscriptionDesc")}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-5 ${
                  plan.highlighted
                    ? "border-accent bg-accent/5"
                    : "border-line bg-surface"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm">
                    <span className="text-xl font-semibold">
                      €{plan.price}
                    </span>
                    <span className="text-muted">/{plan.period}</span>
                  </p>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check size={14} className="text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                {plan.id !== "free" && (
                  <div className="mt-4 flex gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <Button
                        key={m.id}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => startCheckout(plan.id, m.id)}
                      >
                        {m.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Button variant="ghost" onClick={signOut}>
            <LogOut size={18} /> {t("profile.logout")}
          </Button>
        </div>
      </main>

      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
