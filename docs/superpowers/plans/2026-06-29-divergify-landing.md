# Divergify Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public bilingual Divergify marketing landing (13 sections, "The Cockpit" art direction) as a React page inside the existing app, with a real waitlist CTA.

**Architecture:** A `LandingPage` (route `/` for unauthenticated visitors) composed of focused per-section components under `src/components/landing/`. Landing colours are a FIXED palette scoped under a `.landing` wrapper in `index.css` (isolated from the app's themeable `@theme` tokens). Copy is bilingual via the existing `useI18n()` (`landing.*` keys, EN canonical + IT). The CTA writes to the real waitlist via `accessService.addToWaitlist()`.

**Tech Stack:** React 19 · Vite · Tailwind v4 (CSS-var tokens) · Framer Motion · react-router-dom · lucide-react. Google Fonts: Space Grotesk, Spline Sans, IBM Plex Mono.

**Reference (exact copy & markup):** `docs/divergify-landing-handoff/divergify-site-source.dc.html` — the hi-fi prototype. It contains the **final copy in both languages inline**: English in `.lang-en` spans, Italian in `.lang-it` spans, in source order section by section. Lift copy verbatim from there; do not invent or re-translate. Layout details are also summarised in `docs/divergify-landing-handoff/README.md` ("Screens / Views — i 13 blocchi").

**Testing approach (read before starting):** This repo has **no test runner** (devDeps are ESLint + Vite only) and CLAUDE.md defines the verification workflow as *build-green + preview-verify*. Per instruction priority (user CLAUDE.md > skill defaults) this plan does **not** introduce a unit-test framework. Verification is: `npm run build` passes + the **preview MCP** (`preview_start` name `dev`) in mock mode (sections render, interactions work, `preview_console_logs` level error is clean). The only logic with branches — email validation + waitlist routing — is isolated in a pure helper (`isValidEmail`) kept trivially correct and verified by exercising the form in preview.

**Mock-mode preview setup (do this once before previewing):** the app needs a fake user in mock mode only for the *authenticated* app; the **landing is shown to unauthenticated visitors**, so no fake user is needed — just ensure Supabase env is absent so the app is in mock mode, then visit `/`. To force mock mode locally if `.env.local` exists: `Rename-Item .env.local .env.local.bak` before previewing, and **always restore** afterwards: `Rename-Item .env.local.bak .env.local`.

---

## File Structure

**Created:**
- `src/pages/LandingPage.jsx` — composes the 13 sections in order; wraps everything in `<div className="landing">`.
- `src/components/landing/SectionWrap.jsx` — section shell (max-width, padding, bottom border, bg variant).
- `src/components/landing/Placeholder.jsx` — striped image placeholder + mono caption (the image swap point).
- `src/components/landing/MonoKicker.jsx` — mono uppercase kicker/label + `Pill` tag.
- `src/components/landing/WaitlistForm.jsx` — email input → `addToWaitlist`; idle/success/already/error states.
- `src/components/landing/isValidEmail.js` — pure email-format helper.
- `src/components/landing/LandingNav.jsx`
- `src/components/landing/Hero.jsx`
- `src/components/landing/CockpitBand.jsx`
- `src/components/landing/TrustStrip.jsx`
- `src/components/landing/ProblemSection.jsx`
- `src/components/landing/HowItWorks.jsx`
- `src/components/landing/WidgetShowcase.jsx`
- `src/components/landing/BuiltForYourBrain.jsx`
- `src/components/landing/Manifesto.jsx`
- `src/components/landing/Personalization.jsx`
- `src/components/landing/Pricing.jsx`
- `src/components/landing/Faq.jsx`
- `src/components/landing/FinalCta.jsx`
- `src/components/landing/LandingFooter.jsx`

**Modified:**
- `src/App.jsx` — unauthenticated routes: `/` → Landing, `/login` → Login.
- `src/index.css` — `.landing` token block + landing base styles.
- `index.html` — add Google Fonts link + update title/description.
- `src/lib/i18n/translations.js` — `landing.*` keys (EN + IT).

**Reused unchanged:** `plans.js`, `accessService.js`, `LanguageContext`, `ThemeContext`.

**Naming conventions locked (used across tasks):**
- Landing CSS vars: `--lp-bg`, `--lp-panel`, `--lp-cream`, `--lp-cream-ink`, `--lp-cream-muted`, `--lp-accent`, `--lp-accent-ink`, `--lp-content`, `--lp-muted`, `--lp-line`.
- i18n root key: `landing`. Sub-blocks: `nav`, `hero`, `trust`, `problem`, `how`, `showcase`, `brain`, `manifesto`, `personalization`, `pricing`, `faq`, `cta`, `footer`.
- `SectionWrap` prop `bg`: `"dark"` (default) | `"cream"` | `"accent"`.
- `WaitlistForm` calls `addToWaitlist(email)`, `isAllowed(email)`, `loadWaitlist()` from `src/lib/access/accessService.js`.

---

## Task 1: Foundation — fonts, meta, landing tokens

**Files:**
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Add Google Fonts + update title/description in `index.html`**

In `index.html`, replace the single Inter font `<link>` line:
```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```
with a combined link that keeps Inter (used by the app) and adds the three landing fonts:
```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Spline+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```
Update the `<title>` and description:
```html
    <meta name="description" content="Divergify — your second brain, finally on your side. A widget dashboard built for ADHD minds." />
```
```html
    <title>Divergify — your second brain, finally on your side</title>
```

- [ ] **Step 2: Add the `.landing` token block + base styles to `src/index.css`**

Append to the END of `src/index.css`:
```css
/* ----------------------------------------------------------------------
   Divergify landing — FIXED palette, isolated from the app's themeable
   @theme tokens (the app can be re-themed to total black; the marketing
   page must stay on its own art direction). Scoped under .landing.
---------------------------------------------------------------------- */
.landing {
  --lp-bg: #1b1815;          /* dark warm page bg */
  --lp-panel: #252019;       /* dark panels */
  --lp-cream: #f4eee2;       /* alternate cream sections */
  --lp-cream-ink: #211f1b;
  --lp-cream-muted: #4a463f;
  --lp-accent: #8f78ff;      /* flat purple accent (NO gradients) */
  --lp-accent-ink: #1b1043;  /* ink on purple */
  --lp-content: #efe9dd;     /* text on dark */
  --lp-muted: #b8b1a4;       /* muted text on dark */
  --lp-mono-muted: #9a9183;  /* mono labels */
  --lp-line: rgba(239, 233, 221, 0.1);  /* borders on dark */

  background: var(--lp-bg);
  color: var(--lp-content);
  font-family: "Spline Sans", ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
}
.landing .lp-display { font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.02em; }
.landing .lp-mono { font-family: "IBM Plex Mono", ui-monospace, monospace; }
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: build completes with no errors (the new CSS is valid; `index.html` still parses).

- [ ] **Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat(landing): fonts, meta and .landing design tokens

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Routing + LandingPage shell + SectionWrap + section stubs

Goal: `/` renders a scrollable LandingPage made of stub sections, so the whole page exists end-to-end before filling each section. This makes every later section task independently verifiable.

**Files:**
- Create: `src/components/landing/SectionWrap.jsx`
- Create: `src/pages/LandingPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `SectionWrap.jsx`**

```jsx
// src/components/landing/SectionWrap.jsx
// Section shell: full-bleed bg, centered 1240px content, generous padding,
// hairline bottom border. bg variant switches the colour context.
const BG = {
  dark: { background: "var(--lp-bg)", color: "var(--lp-content)" },
  cream: { background: "var(--lp-cream)", color: "var(--lp-cream-ink)" },
  accent: { background: "var(--lp-accent)", color: "var(--lp-accent-ink)" },
};

export default function SectionWrap({ id, bg = "dark", className = "", children }) {
  return (
    <section
      id={id}
      style={BG[bg]}
      className="w-full border-b"
    >
      <div
        className={`mx-auto max-w-[1240px] px-6 py-20 sm:px-16 sm:py-[120px] ${className}`}
        style={{ borderColor: "var(--lp-line)" }}
      >
        {children}
      </div>
    </section>
  );
}
```
Note: the hairline border is on the `<section>` via Tailwind `border-b`; set its colour inline since `--lp-line` is a landing var. Add `style={{ borderColor: "var(--lp-line)" }}` to the `<section>` as well:
```jsx
    <section id={id} style={{ ...BG[bg], borderColor: "var(--lp-line)" }} className="w-full border-b">
```
(Use this corrected `<section>` line; drop the inner border style.)

- [ ] **Step 2: Create `LandingPage.jsx` with stub sections**

```jsx
// src/pages/LandingPage.jsx
import SectionWrap from "../components/landing/SectionWrap";

// Temporary stubs — each becomes its own component in later tasks.
function Stub({ id, label, bg }) {
  return (
    <SectionWrap id={id} bg={bg}>
      <p className="lp-mono text-xs uppercase tracking-[0.2em]" style={{ opacity: 0.6 }}>
        [{label}]
      </p>
    </SectionWrap>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <Stub id="top" label="nav" />
      <Stub id="hero" label="hero" />
      <Stub label="trust" />
      <Stub label="problem" bg="cream" />
      <Stub id="how" label="how it works" />
      <Stub id="product" label="widget showcase" />
      <Stub label="built for your brain" />
      <Stub id="manifesto" label="manifesto" bg="cream" />
      <Stub label="personalization" />
      <Stub id="pricing" label="pricing" />
      <Stub label="faq" />
      <Stub id="cta" label="final cta" bg="accent" />
      <Stub label="footer" />
    </div>
  );
}
```

- [ ] **Step 3: Wire routing in `src/App.jsx`**

Add the import near the other page imports:
```jsx
import LandingPage from "./pages/LandingPage";
```
Replace the unauthenticated block:
```jsx
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }
```
with:
```jsx
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
```
(`Navigate` is already imported in `App.jsx`.)

- [ ] **Step 4: Verify in preview**

If `.env.local` exists: `Rename-Item .env.local .env.local.bak` (PowerShell) so the app is in mock mode.
Start preview: `preview_start` name `dev`. Open `/`.
Expected: a dark, scrollable page with 13 stub bands; the `problem`, `manifesto` bands are cream; `final cta` is purple. `preview_console_logs` level error: clean.
Restore env if moved: `Rename-Item .env.local.bak .env.local`.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/App.jsx src/pages/LandingPage.jsx src/components/landing/SectionWrap.jsx
git commit -m "feat(landing): public route, page shell and SectionWrap

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Shared primitives — Placeholder, MonoKicker/Pill, isValidEmail, WaitlistForm + base i18n keys

**Files:**
- Create: `src/components/landing/Placeholder.jsx`
- Create: `src/components/landing/MonoKicker.jsx`
- Create: `src/components/landing/isValidEmail.js`
- Create: `src/components/landing/WaitlistForm.jsx`
- Modify: `src/lib/i18n/translations.js`

- [ ] **Step 1: Create `Placeholder.jsx`** (striped image placeholder + mono caption — the image swap point)

```jsx
// src/components/landing/Placeholder.jsx
// Editorial placeholder for a real photo/screenshot. Diagonal stripes +
// monospace caption in [square brackets]. Replace with <img> at go-live.
export default function Placeholder({ caption, height = 480, className = "" }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[18px] ${className}`}
      style={{
        height,
        border: "1px solid var(--lp-line)",
        backgroundColor: "var(--lp-panel)",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(239,233,221,.05) 0 12px, transparent 12px 24px)",
      }}
    >
      <span
        className="lp-mono absolute bottom-4 left-4 right-4 text-[11px] uppercase tracking-[0.12em]"
        style={{ color: "var(--lp-mono-muted)" }}
      >
        {caption}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create `MonoKicker.jsx`** (kicker + Pill tag)

```jsx
// src/components/landing/MonoKicker.jsx
export function MonoKicker({ children, className = "", color = "var(--lp-accent)" }) {
  return (
    <p
      className={`lp-mono text-[12px] font-medium uppercase tracking-[0.2em] ${className}`}
      style={{ color }}
    >
      {children}
    </p>
  );
}

export function Pill({ children, color = "var(--lp-accent)", filled = false }) {
  return (
    <span
      className="lp-mono inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em]"
      style={
        filled
          ? { background: color, color: "var(--lp-accent-ink)" }
          : { border: `1px solid ${color}`, color }
      }
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create `isValidEmail.js`**

```js
// src/components/landing/isValidEmail.js
// Minimal, intentionally permissive email-format check for the waitlist form.
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}
```

- [ ] **Step 4: Add base i18n keys (`landing.common` + `landing.waitlist`) in `translations.js`**

In `src/lib/i18n/translations.js`, inside `TRANSLATIONS.en`, add a top-level `landing` block (place it after the last existing block in `en`; mind the trailing comma of the previous block):
```js
    landing: {
      waitlist: {
        placeholder: "you@email.com",
        cta: "Enter early access",
        success: "You're on the list. We'll be in touch.",
        already: "You're already in — check your inbox.",
        invalid: "Please enter a valid email.",
        error: "Something went wrong. Try again.",
      },
    },
```
Then inside `TRANSLATIONS.it`, add the parallel block:
```js
    landing: {
      waitlist: {
        placeholder: "tu@email.com",
        cta: "Entra in early access",
        success: "Sei in lista. Ti scriviamo presto.",
        already: "Ci sei già — controlla la tua inbox.",
        invalid: "Inserisci un'email valida.",
        error: "Qualcosa è andato storto. Riprova.",
      },
    },
```
Later tasks will add more sub-keys under this `landing` block.

- [ ] **Step 5: Create `WaitlistForm.jsx`**

```jsx
// src/components/landing/WaitlistForm.jsx
import { useState } from "react";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { addToWaitlist, isAllowed, loadWaitlist } from "../../lib/access/accessService";
import { isValidEmail } from "./isValidEmail";

// status: "idle" | "success" | "already" | "invalid" | "error"
export default function WaitlistForm({ dark = true }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  function submit(e) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!isValidEmail(value)) return setStatus("invalid");
    try {
      if (isAllowed(value) || loadWaitlist().some((w) => w.email === value)) {
        return setStatus("already");
      }
      addToWaitlist(value);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "already") {
    return (
      <p className="lp-mono text-sm" style={{ color: dark ? "var(--lp-content)" : "var(--lp-accent-ink)" }}>
        {t(`landing.waitlist.${status}`)}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
        placeholder={t("landing.waitlist.placeholder")}
        aria-label={t("landing.waitlist.placeholder")}
        className="lp-mono flex-1 rounded-full px-5 py-3 text-sm outline-none"
        style={{ background: "var(--lp-panel)", color: "var(--lp-content)", border: "1px solid var(--lp-line)" }}
      />
      <button
        type="submit"
        className="lp-mono rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.1em]"
        style={{ background: "var(--lp-accent)", color: "var(--lp-accent-ink)" }}
      >
        {t("landing.waitlist.cta")}
      </button>
      {status === "invalid" || status === "error" ? (
        <span className="sr-only">{t(`landing.waitlist.${status}`)}</span>
      ) : null}
    </form>
  );
}
```
Note: the inline error/invalid message should be visible, not only `sr-only`. Replace the trailing `{status === "invalid" ...}` block by rendering the message below the form instead — implement as: wrap the `<form>` in a `<div>` and show `<p className="lp-mono text-xs" style={{color:'#e0a0a0'}}>{t('landing.waitlist.'+status)}</p>` when `status === 'invalid' || status === 'error'`.

- [ ] **Step 6: Verify in preview (build first)**

Run: `npm run build` — expected: passes.
In preview, temporarily drop a `<WaitlistForm />` into `LandingPage` (or wait for Task 16 which mounts it). Minimal check now: build is green and the imports resolve. Full interaction is verified in Task 16 (FinalCta).

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/Placeholder.jsx src/components/landing/MonoKicker.jsx src/components/landing/isValidEmail.js src/components/landing/WaitlistForm.jsx src/lib/i18n/translations.js
git commit -m "feat(landing): shared primitives (Placeholder, kicker, waitlist form) + base i18n

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Section tasks (4–16) — shared recipe

Each section task follows the **same recipe**. Per section:

1. **Open the reference** `docs/divergify-landing-handoff/divergify-site-source.dc.html` and find the matching block (order matches the README "13 blocchi" list and the stub order). Note its inline styles (colours, font-sizes, grid ratios) and its `.lang-en` / `.lang-it` copy.
2. **Create the component** under `src/components/landing/`, using landing tokens (`var(--lp-*)`) and the `lp-display` / `lp-mono` font classes instead of the prototype's hardcoded hex/fonts. Use `SectionWrap` for the outer shell where the section is a standard band. Use `Placeholder` for every image slot, copying its bracketed mono caption verbatim from the reference.
3. **Add i18n keys** under the section's sub-block in BOTH `TRANSLATIONS.en` and `TRANSLATIONS.it` in `translations.js`. EN copy = the `.lang-en` text from the reference; IT copy = the `.lang-it` text. Render all visible copy via `t("landing.<block>.<key>")`. Never hardcode user-facing strings.
4. **Replace the stub** in `LandingPage.jsx` with the real component (keep the same `id`/`bg`).
5. **Verify in preview**: the section renders, matches the reference layout, is readable (contrast), and `preview_console_logs` level error is clean. Use `preview_resize` to a ~390px width and confirm it collapses to one column (`@media max-width:880px` behaviour).
6. **Build + commit**: `npm run build` green, then commit `feat(landing): <section> section`.

Animations: wrap the section's main content in a Framer Motion fade+rise on scroll-in **only if** `useReducedMotion()` is false. Pattern to reuse:
```jsx
import { motion, useReducedMotion } from "framer-motion";
// inside component:
const reduce = useReducedMotion();
const anim = reduce
  ? {}
  : { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.4 } };
// <motion.div {...anim}> ... </motion.div>
```

---

## Task 4: LandingNav

**Files:** Create `src/components/landing/LandingNav.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1: Build the nav** — sticky `top-0 z-40`, bg `rgba(27,24,21,.86)` + `backdrop-blur-[12px]`, NOT inside `SectionWrap` (it's a fixed bar). Left: "Divergify" wordmark (`lp-display`, weight 600) + a purple dot (`8px`, `var(--lp-accent)`). Center/right (hidden under 880px via `hidden md:flex`): anchor links Product/How it works/Pricing/Manifesto pointing to `#product`/`#how`/`#pricing`/`#manifesto`. Then an EN/IT toggle (two buttons calling `setLang('en')`/`setLang('it')` from `useI18n()`, active one emphasised) and a purple pill CTA linking to `#cta` with `t("landing.nav.cta")`.
- [ ] **Step 2: i18n** — add `landing.nav` block (EN+IT): `product`, `how`, `pricing`, `manifesto`, `cta` (CTA reuse: "Enter early access" / "Entra in early access"). Pull exact link labels from the reference nav.
- [ ] **Step 3: Mount** in `LandingPage` above the hero (replace the `nav` stub; render `<LandingNav />` as the first child of `.landing`, outside `SectionWrap`).
- [ ] **Step 4: Verify** preview — bar sticks on scroll, blur visible, lang toggle switches all already-translated copy, CTA scrolls to `#cta`. Console clean.
- [ ] **Step 5:** `npm run build` + commit `feat(landing): sticky nav with lang toggle and CTA`.

---

## Task 5: Hero + CockpitBand

**Files:** Create `src/components/landing/Hero.jsx`, `src/components/landing/CockpitBand.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1: CockpitBand** — a horizontal row of mono status pills with semantic dots, from the reference: `Today` · `Next 14:30` · `Big 3 1/3` · `Inbox 2` · `18° clear`. Dots use semantic colours (green `#2fb380`, amber `#f0a132`, cyan `#22b8cf`, etc.). Copy the exact pill labels; expose the changeable words via `landing.hero.cockpit.*` keys.
- [ ] **Step 2: Hero** — grid `1.12fr / 0.88fr` (stack on mobile). Left: mono purple kicker (`MonoKicker`), H1 66px `lp-display` — EN "Everything that matters, on **one screen** — finally." / IT "Tutto ciò che conta, su una schermata sola — finalmente." (lift exact from reference), sub-paragraph, primary CTA (purple pill → `#cta`) + a secondary text link "Watch the 60s tour". Right: `Placeholder` portrait (height 480, caption from reference) with a floating product card (mini widget grid) bottom-left (`box-shadow: 0 22px 48px rgba(0,0,0,.5)`). Below the grid: `<CockpitBand />`.
- [ ] **Step 3: i18n** — `landing.hero` block EN+IT: `kicker`, `h1` (use the exact phrasing; keep "one screen" emphasised via markup, not a separate key), `sub`, `ctaPrimary`, `ctaSecondary`, plus `cockpit.today/next/big3/inbox/weather`.
- [ ] **Step 4: Mount** replacing the `hero` stub.
- [ ] **Step 5: Verify** preview at desktop + 390px (grid collapses, H1 → 42px). Console clean.
- [ ] **Step 6:** build + commit `feat(landing): hero with cockpit band`.

---

## Task 6: TrustStrip

**Files:** Create `src/components/landing/TrustStrip.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** Single row inside `SectionWrap`: big "3,000+" (`lp-display` 34px) + waitlist label; a short tester quote; a "Built by an ADHD founder" badge with a green dot (`#2fb380`). Lift copy from reference.
- [ ] **Step 2: i18n** `landing.trust`: `count` ("3,000+"), `countLabel`, `quote`, `badge`.
- [ ] **Step 3:** Mount replacing the `trust` stub. **Step 4:** verify. **Step 5:** build + commit `feat(landing): trust strip`.

---

## Task 7: ProblemSection (cream)

**Files:** Create `src/components/landing/ProblemSection.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap bg="cream"`. Grid `1.05fr / 0.95fr`. Left: H2 52px `lp-display` — "Ten apps open. Still nothing done." (exact EN/IT from reference); three numbered pain points (01–03, ruled). Right: `Placeholder` (chaotic desk photo, caption from reference). Use cream-context colours (`--lp-cream-ink`, `--lp-cream-muted`).
- [ ] **Step 2: i18n** `landing.problem`: `h2`, `p1`/`p2`/`p3` (the three pain points), and their `t1`/`t2`/`t3` titles if the reference splits title+body. Match the reference structure.
- [ ] **Step 3:** Mount (`problem` stub, keep `bg="cream"`). **Step 4:** verify (cream legible). **Step 5:** build + commit `feat(landing): the problem section`.

---

## Task 8: HowItWorks

**Files:** Create `src/components/landing/HowItWorks.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap id="how"`. Kicker + H2 48px; 3 columns, each: number 40px purple, 2px purple top rule, title 24px, description. Steps: Dump everything / See what matters / Do one thing (exact copy from reference).
- [ ] **Step 2: i18n** `landing.how`: `kicker`, `h2`, then `s1.title/s1.body`, `s2.*`, `s3.*`.
- [ ] **Step 3:** Mount (`how` stub). **Step 4:** verify (3→1 col on mobile). **Step 5:** build + commit `feat(landing): how it works`.

---

## Task 9: WidgetShowcase

**Files:** Create `src/components/landing/WidgetShowcase.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap id="product"`, centered. H2 "Your whole stack, on one screen." (exact EN/IT); large `Placeholder` (height ~560, dashboard screenshot caption from reference — this is a primary image-swap slot); below it a wrap of mono widget chips (`Pill`): Gmail, Calendar, To-Do, Brain Dump, AI Chat, Weather, Pomodoro, Mood & Energy, Habits.
- [ ] **Step 2: i18n** `landing.showcase`: `h2`, `sub` (if present). The widget chip names are proper nouns — keep them in a `chips` array constant in the component (not translated).
- [ ] **Step 3:** Mount (`product` stub). **Step 4:** verify. **Step 5:** build + commit `feat(landing): widget showcase`.

---

## Task 10: BuiltForYourBrain

**Files:** Create `src/components/landing/BuiltForYourBrain.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap`. Editorial **ruled rows** (NOT cards): per row grid `0.8fr / 1.2fr`, left = feature name + a coloured `Pill` tag, right = description. 6 features from reference: Cockpit, Big 3, Chunk-it (AI·Claude), Brain Dump, One-thing focus, Energy × Time. Each row separated by a hairline `var(--lp-line)`.
- [ ] **Step 2: i18n** `landing.brain`: `kicker`/`h2` if present, plus `f1.name/f1.tag/f1.body` … `f6.*` (lift names, tags, bodies from reference).
- [ ] **Step 3:** Mount (`built for your brain` stub). **Step 4:** verify (rows stack on mobile). **Step 5:** build + commit `feat(landing): built for your brain`.

---

## Task 11: Manifesto (cream)

**Files:** Create `src/components/landing/Manifesto.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap id="manifesto" bg="cream"`, max-width 1000px. Statement 40px `lp-display` weight 500 with keywords emphasised in green (`#2fb380`); closing mono line. Lift exact statement EN/IT from reference; keep the emphasised keywords as inline `<span>` markup.
- [ ] **Step 2: i18n** `landing.manifesto`: `statement` (with keyword spans handled in markup — split into `statementParts` keys if the green words must stay translatable; otherwise one `statement` key per language with the same phrase and emphasise via fixed substrings — prefer splitting into 2–3 segment keys to keep emphasis robust across languages).
- [ ] **Step 3:** Mount (`manifesto` stub, `bg="cream"`). **Step 4:** verify. **Step 5:** build + commit `feat(landing): manifesto`.

---

## Task 12: Personalization

**Files:** Create `src/components/landing/Personalization.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap`. Grid `1fr / 1fr`. Left: text. Right: a mock "preferences" panel — theme chips (Light / Cream / **Total Black** selected), 6 accent swatches (purple active with outline), dashed chips Drag / Pin·max 6 / Dilate / IT·EN. This is a static visual mock (no real wiring). Use landing tokens for the panel; the accent swatches use the semantic colours from §Design Tokens.
- [ ] **Step 2: i18n** `landing.personalization`: `kicker`/`h2`/`body`, plus chip labels `themeLight`/`themeCream`/`themeBlack`, `drag`/`pin`/`dilate`/`lang`.
- [ ] **Step 3:** Mount (`personalization` stub). **Step 4:** verify. **Step 5:** build + commit `feat(landing): personalization`.

---

## Task 13: Pricing (from plans.js)

**Files:** Create `src/components/landing/Pricing.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1: Build the two cards** reading numbers from `plans.js` so prices can't drift:
```jsx
import { PLANS, PAYMENT_METHODS } from "../../lib/payments/plans.js";
// price/currency/period come from PLANS; bullet copy + names come from i18n.
```
Layout: `SectionWrap id="pricing"`, max-width 900px, 2 columns. Map `PLANS`: render `plan.price === 0 ? "€0" : "€" + plan.price` (Space Grotesk 52px) + period from `t("landing.pricing.period.free")` / `period.pro` (do NOT use `plan.period`, which is Italian-only). The Pro card (`plan.highlighted`) gets a purple border + a "Most popular" badge (`t("landing.pricing.badge")`). Feature bullets come from `t("landing.pricing.free.f1..f3")` and `t("landing.pricing.pro.f1..f4")` (EN+IT), NOT from `plan.features` (those are IT-only). Below the cards: a methods line built from `PAYMENT_METHODS` labels → render `t("landing.pricing.methods")` = "Pay with card (Stripe) or crypto · cancel anytime" / IT equivalent.
- [ ] **Step 2: i18n** `landing.pricing`: `h2`, `badge`, `period.free`, `period.pro`, `free.name`/`free.f1..f3`, `pro.name`/`pro.f1..f4`, `methods`. EN values from §7 of the spec / reference; IT parallel.
- [ ] **Step 3:** Mount (`pricing` stub). **Step 4:** verify both prices show €0 and €6 and match `plans.js`. **Step 5:** build + commit `feat(landing): pricing from plans.js`.

---

## Task 14: Faq

**Files:** Create `src/components/landing/Faq.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap`, max-width 860px. Use native `<details><summary>` per question (accessible, no JS). 5 questions from reference: data privacy, "works without ADHD?", devices, diagnosis needed?, cancellation. A "+" icon rotates 45° when open via CSS (`details[open] .lp-faq-icon { transform: rotate(45deg); }`, transition 0.2s) — add this rule to `index.css` under `.landing`.
- [ ] **Step 2: i18n** `landing.faq`: `q1.q/q1.a` … `q5.q/q5.a` (lift EN/IT from reference).
- [ ] **Step 3:** Mount (`faq` stub). **Step 4:** verify expand/collapse + icon rotation + keyboard focus. **Step 5:** build + commit `feat(landing): faq`.

---

## Task 15: FinalCta (purple) + wire WaitlistForm

**Files:** Create `src/components/landing/FinalCta.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** `SectionWrap id="cta" bg="accent"`, centered. H2 58px `lp-display` "Give your brain a second one." (exact EN/IT). Render `<WaitlistForm dark={false} />` and a small "3,000+ already in" line (`t("landing.cta.social")`). On the purple bg, text uses `--lp-accent-ink`.
- [ ] **Step 2: i18n** `landing.cta`: `h2`, `social`. (Waitlist strings already exist under `landing.waitlist`.)
- [ ] **Step 3:** Mount (`final cta` stub, keep `bg="accent"`).
- [ ] **Step 4: Verify the real waitlist end-to-end in preview** (this is the key interaction check):
  - `preview_fill` the email input with `test-newuser@example.com`, submit → success message appears.
  - Confirm persistence: `preview_eval` `JSON.parse(localStorage.getItem('diverge.waitlist'))` → contains the email.
  - Submit a seeded allowlisted email (`igor.bragato@gmail.com`) → "already in" message.
  - Submit `notanemail` → invalid message; submit empty → invalid.
  - `preview_console_logs` level error: clean.
- [ ] **Step 5:** build + commit `feat(landing): final CTA with real waitlist`.

---

## Task 16: LandingFooter

**Files:** Create `src/components/landing/LandingFooter.jsx`; Modify `translations.js`, `LandingPage.jsx`.

- [ ] **Step 1:** 4-column grid (Brand + Product + Company + Legal) + bottom bar: copyright, email `hello@divergify.app`, EN/IT toggle (reuse `setLang`). Render outside or inside a final `SectionWrap` per the reference. Lift link labels from reference.
- [ ] **Step 2: i18n** `landing.footer`: column headings + link labels (`product.*`, `company.*`, `legal.*`), `email`, `rights`.
- [ ] **Step 3:** Mount (`footer` stub). **Step 4:** verify (collapses on mobile; lang toggle works). **Step 5:** build + commit `feat(landing): footer`.

---

## Task 17: Polish pass — responsive, reduced-motion, a11y, final verify

**Files:** Touch any landing component as needed; possibly `src/index.css`.

- [ ] **Step 1: Responsive sweep** — in preview, `preview_resize` to 390px and 768px. Walk every section: grids collapse to one column, padding is 24px (`px-6`), H1 is ~42px, nav links are hidden and replaced by a usable mobile affordance (at minimum the CTA pill stays reachable; if the reference relied on hidden links, ensure Pricing/Manifesto are still reachable by scrolling). Fix any overflow (horizontal scroll = bug).
- [ ] **Step 2: Reduced motion** — `preview_eval` to emulate: confirm with `window.matchMedia('(prefers-reduced-motion: reduce)')` reasoning; verify every section still renders fully when motion is off (Framer `whileInView` content must not stay invisible — `useReducedMotion()` must disable the initial opacity:0). Manually set `reduce` true path if needed and re-check no section is blank.
- [ ] **Step 3: A11y/contrast** — check cream sections (dark ink on cream) and purple CTA (dark ink on purple) meet readable contrast; all interactive elements are reachable by keyboard (`Tab`), focus ring visible (the global `:focus-visible` rule applies). Images/placeholders have meaningful captions; the page has one `<h1>` (hero) and logical heading order.
- [ ] **Step 4: Language sweep** — toggle EN↔IT; confirm NO hardcoded English/Italian remains (every visible string flips). Grep for suspicious literals: `git grep -nE ">[A-Z][a-z]+ " src/components/landing` and eyeball for untranslated copy.
- [ ] **Step 5: Final build + console** — `npm run build` green; `preview_console_logs` level error empty across a full scroll.
- [ ] **Step 6: Screenshot proof** — `preview_screenshot` desktop + mobile for the record.
- [ ] **Step 7: Commit** `feat(landing): responsive, reduced-motion and a11y polish`.

---

## Deploy note (NOT part of implementation — surface to user at the end)

Going live makes the SPA public. Per the spec §2, with a client-side SPA the edge gate (`middleware.js`) can't selectively gate `/` vs the app. Before the public launch the user must decide: **(a)** retire/neutralise the black gate (rely on Supabase auth + early-access allowlist), or **(b)** keep it until the allowlist hook is fully enforced (the landing then stays behind the curtain until opened). Also pending before final go-live (out of scope here, per user): final pricing, and real photos/screenshots replacing the `Placeholder` captions. Do not change gate config as part of this plan.
```
