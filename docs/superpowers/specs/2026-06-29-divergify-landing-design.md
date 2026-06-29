# Divergify — Landing site (React/Vite) — Design

**Date:** 2026-06-29
**Art direction:** "The Cockpit" (editoriale/premium, dark warm, accento viola flat, niente gradienti).
**Source:** handoff design package (`docs/divergify-design-brief.md` + prototipo HTML hi-fi).
**Scope:** ricreare la landing pubblica bilingue (13 blocchi) come pagina React dentro l'app esistente — non spedire l'HTML del prototipo.

> Decisioni di brainstorming (utente, 2026-06-29):
> - **Architettura:** rotta nell'app esistente (stesso repo/deploy Vercel), non progetto separato.
> - **Immagini:** placeholder editoriali ora; foto/screenshot reali prima del deploy definitivo.
> - **CTA:** waitlist reale via `accessService.addToWaitlist()`.
> - **Prezzi:** quelli attuali di `plans.js` (€0 / €6) ora; possibile raffinamento prima del go-live.

---

## 1. Obiettivo

Landing marketing pubblica di **Divergify** (rinominato da DiVerge): racconta il prodotto
(dashboard a widget ADHD-friendly) e porta i visitatori in **waitlist / early access**.
Hi-fi: colori, tipografia, spaziature e interazioni del prototipo sono definitivi; le immagini
sono placeholder editoriali da sostituire con foto reali prima del go-live.

## 2. Architettura & routing

Pagina React nello **stesso repo/deploy** dell'app. In `src/App.jsx`, ramo **non autenticato**:

| Path | Element |
|------|---------|
| `/` | `LandingPage` (oggi `LoginPage`) |
| `/login` | `LoginPage` (entry auth esistente, con allowlist + waitlist) |
| `*` | `Navigate to="/"` |

Ramo **autenticato** invariato (`/` → `DashboardPage`). Quindi la landing è ciò che vede un
visitatore **non loggato**; un utente loggato su `/` continua a vedere la dashboard.
Le CTA della landing puntano al form waitlist interno (`#cta`); il link "Sign in" → `/login`.

### Implicazione sul gate (deploy-time, non blocca la build)

`middleware.js` è un gate edge che matcha `/:path*` e fa **fail-closed**. Con una SPA
client-side **non si può** gate-are selettivamente `/` vs `/dashboard` all'edge: tutte le
route servono lo stesso `index.html` e il routing è lato client. Rendere pubblica la landing
significa quindi **aprire la SPA** e affidare la protezione dell'app a **Supabase auth +
allowlist early-access** (chi non è loggato vede solo landing/login; la dashboard richiede
sessione). Il "curtain" nero diventa ridondante — coerente con la nota in `CLAUDE.md`
("the curtain is removed once early access is live").

- **In locale** il gate non gira (è solo Vercel Edge) → build e verifica via preview non sono
  impattate.
- **Al deploy** l'utente decide se: (a) spegnere il gate (rimuovere/neutralizzare
  `middleware.js`, affidandosi a auth+allowlist), oppure (b) tenerlo finché l'allowlist non è
  pienamente attiva (la landing resterà dietro il curtain finché non lo si apre).
- Questa scelta è uno **step finale di deploy documentato nel piano**, non un prerequisito
  dell'implementazione.

## 3. Struttura componenti

`src/components/landing/` — un componente per sezione + primitive condivise. `LandingPage.jsx`
(in `src/pages/`) li compone in ordine.

**Sezioni (13 blocchi):**
`LandingNav` · `Hero` · `TrustStrip` · `ProblemSection` · `HowItWorks` · `WidgetShowcase` ·
`BuiltForYourBrain` · `Manifesto` · `Personalization` · `Pricing` · `Faq` · `FinalCta` ·
`LandingFooter`.

**Primitive condivise:**
- `SectionWrap` — full-bleed, max-width contenuto 1240px, padding orizz. 64px (24px <880px),
  padding verticale 120px, `border-bottom: 1px solid rgba(239,233,221,.1)`. Prop per varianti
  sfondo (dark / cream / accent).
- `Placeholder` — box a righe diagonali + didascalia monospace tra parentesi quadre
  (es. `[ warm portrait — … ]`). Prop: ratio/altezza, caption. **Punto di sostituzione**
  per le immagini reali.
- `WaitlistForm` — input email + submit → `addToWaitlist()`; stati idle/success/duplicato/errore.
- `MonoKicker` / `Pill` — label/kicker IBM Plex Mono uppercase; pill colorate (tag feature).
- `CockpitBand` — fascia status pills mono (Today · Next 14:30 · Big 3 1/3 · Inbox 2 ·
  18° clear) con dot semantici; usata nell'hero.

Ogni file resta focalizzato (una sezione = un file), così è editabile/verificabile in isolamento.

## 4. Design tokens (palette FISSA, isolata dal tema app)

La landing ha una palette propria che **non deve** seguire i token `@theme` mutati a runtime da
`ThemeContext` (l'utente può mettere l'app in total black). Si definiscono **token
landing-scoped** sotto un wrapper (es. classe `.landing`) in `src/index.css`:

```css
.landing {
  --lp-bg: #1b1815;          /* dark warm */
  --lp-panel: #252019;       /* + #272219 #2a251d #352f25 */
  --lp-cream: #f4eee2;       /* sfondo alternato; ink #211f1b, muted #4a463f */
  --lp-accent: #8f78ff;      /* viola flat; ink su viola #1b1043 */
  --lp-content: #efe9dd;     /* testo su scuro */
  --lp-muted: #b8b1a4;       /* + #cfc8ba; mono-muted #9a9183 */
  --lp-line: rgba(239,233,221,.10);  /* bordi su scuro (.10–.16) */
  /* accenti semantici solo per dot/tag: verde #2fb380, ambra #f0a132,
     ciano #22b8cf, rosa #e864c4, arancio #f97316 */
}
```

I componenti landing usano questi token (non `--color-*`). **Niente gradienti.**

**Raggi:** pill `999px`; card/sezioni-interne `14–20px`; chip `8px`.
**Spaziatura:** container 1240px / pad 64px; sezioni 120px; gap griglie 24–64px.
**Shadow:** card prodotto flottante `0 22px 48px rgba(0,0,0,.5)`.

## 5. Tipografia (Google Fonts)

- **Space Grotesk** (600) — display: H1 66px, H2 44–52px, prezzi 52px. Letter-spacing -.02/-.025em.
- **Spline Sans** (400/500/600) — body 17–20px, line-height ~1.55.
- **IBM Plex Mono** (500) — label/kicker/mono 11–13px, letter-spacing .04–.2em, uppercase.

L'app usa Inter; i font landing si caricano in aggiunta (link Google Fonts), scoperti solo dove
servono. Mobile (`@media max-width:880px`): H1 → 42px.

## 6. i18n

Chiavi `landing.*` (EN canonico + IT parallelo) in `src/lib/i18n/translations.js`, rese con `t()`.
Il toggle EN/IT in nav/footer riusa `setLang` esistente → **un solo stato lingua** per tutta
l'app (niente doppia-copy nel DOM come il prototipo). Default EN come oggi; il default da
`navigator.language` resta un TODO separato (non in scope).

Blocchi di chiavi previsti (indicativo): `landing.nav.*`, `landing.hero.*`, `landing.trust.*`,
`landing.problem.*`, `landing.how.*`, `landing.showcase.*`, `landing.brain.*`,
`landing.manifesto.*`, `landing.personalization.*`, `landing.pricing.*`, `landing.faq.*`,
`landing.cta.*`, `landing.footer.*`.

## 7. Pricing (single source of truth)

Prezzo / valuta / periodo da **`src/lib/payments/plans.js`** (`PLANS`: Free €0, Pro €6/mese) →
nessun drift sui numeri. I **bullet feature** delle card vengono da `landing.pricing.*` i18n
(EN+IT), perché le `features` in `plans.js` sono stringhe solo-IT non adatte al sito EN-default.
Layout: 2 piani (max-width 900px), Pro evidenziato (bordo viola, badge "Most popular"). Riga
metodi: "Pay with card (Stripe) or crypto · cancel anytime" (da `PAYMENT_METHODS`).
**Non inventare prezzi diversi** (brief §7); raffinamento prezzi rimandato al pre-go-live.

## 8. Waitlist reale

`WaitlistForm` chiama `addToWaitlist(email)` da `src/lib/access/accessService.js` (mock
localStorage ora → Supabase poi, swap point già documentato nel service). Comportamento:
- valida l'email (formato);
- se `isAllowed(email)` → messaggio "sei già dentro / you're already in";
- altrimenti `addToWaitlist` → stato success ("You're on the list / Sei in lista");
- gestione duplicato ed errore con messaggi chiari.

Riusato nella CTA nav (che porta a `#cta`) e in `FinalCta`. Coerente con l'uso in `LoginPage`.

## 9. Animazioni & accessibilità

- **Framer Motion**: entrate sottili allo scroll (fade + translate ridotto, ~8–16px), nessun
  effetto lampeggiante. `useReducedMotion()` per disattivarle + il guard CSS
  `prefers-reduced-motion` già presente in `index.css`.
- **Nav sticky** con `backdrop-filter: blur(12px)`, bg `rgba(27,24,21,.86)`.
- **FAQ**: `<details>/<summary>` nativi (accessibili, no JS); "+" ruota a 45° in apertura (0.2s).
- **A11y ADHD-aware** (brief §6): basso carico cognitivo, contrasto alto, CTA sempre chiarissima,
  font leggibile (no testo minuscolo).
- **Responsive** (`@media max-width:880px`): grid → 1 colonna, padding 24px, H1 42px; menu mobile
  per i link nav (il prototipo li nasconde — in produzione serve un toggle).

## 10. SEO / meta (leggero)

`<title>` "Divergify — your second brain, finally on your side", meta description, OG basilari
in `index.html` (o via componente head). Analytics rimandate.

## 11. Testing & verifica

- **Unit test** sulla logica di `WaitlistForm`: validazione email, chiamata `addToWaitlist`,
  rami success / duplicato (`isAllowed`) / errore. (Vitest se presente; altrimenti il piano
  definisce il runner.)
- **Verifica visiva**: preview MCP (`preview_start` name `dev`) in **mock mode**, controllo
  sezioni + responsive (`preview_resize`) + `preview_console_logs` level error = pulito.
- **Build**: `npm run build` deve passare prima del commit.
- Le sezioni puramente presentazionali **non** vengono unit-testate sul markup: si verificano
  via preview.

## 12. Out of scope (esplicito)

- Foto/screenshot reali (placeholder ora; sostituzione pre-go-live).
- Prezzi definitivi (si usano quelli di `plans.js` ora).
- Default lingua da `navigator.language`.
- Spegnimento del gate / scelta di go-live (step di deploy documentato, deciso dall'utente).
- Analytics / OG image grafica.
- Migrazione `accessService` mock → Supabase (già tracciata altrove).

## 13. File toccati / creati

**Creati:**
- `src/pages/LandingPage.jsx`
- `src/components/landing/*` (13 sezioni + ~5 primitive)

**Modificati:**
- `src/App.jsx` (rotte non autenticate: `/` → Landing, `/login` → Login)
- `src/index.css` (token `.landing` + import font)
- `src/lib/i18n/translations.js` (chiavi `landing.*` EN+IT)
- `index.html` (meta/SEO leggeri, link Google Fonts se non in css)

**Non modificati (riuso):** `plans.js`, `accessService.js`, `LanguageContext`, `ThemeContext`.
