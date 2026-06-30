# Handoff: Divergify — Landing Site ("The Cockpit" art direction)

> Per Claude Code: questo pacchetto serve a **mettere online la landing di Divergify su Vercel**, coordinandoti con il design qui allegato. Leggi prima la sezione **"Deploy su Vercel"**: hai due strade (quick deploy del file standalone, oppure ricostruzione in React/Vite). Scegli in base a cosa vuole l'utente.

---

## Overview
Landing/marketing site pubblico di **Divergify** — una dashboard a widget pensata per cervelli ADHD ("il tuo secondo cervello, finalmente dalla tua parte"). Lo scopo del sito è raccontare il prodotto e far entrare le persone in waitlist / early access.

Art direction scelta dal committente: **"The Cockpit"** — editoriale/premium, sfondo scuro caldo, accento viola pieno (flat, niente gradienti), con una "cockpit band" ricorrente come metafora visiva del prodotto. Il sito copre i **13 blocchi** del brief, è **bilingue EN/IT** (default EN, toggle in nav e footer) e responsive.

## About the Design Files
I file in `source/` e il file `divergify-site.html` sono **riferimenti di design realizzati in HTML** — un prototipo hi-fi che mostra look & behavior finali, **non codice di produzione da copiare 1:1**.

- `divergify-site.html` — **versione standalone self-contained** (font + runtime inlinati, ~459KB). Funziona offline, apribile direttamente nel browser. **È deployabile così com'è** (vedi Quick deploy).
- `source/Divergify Site.dc.html` + `source/support.js` — il sorgente "Design Component": template HTML inline-styled + una piccola classe logica JS che gestisce solo il toggle lingua. `support.js` è il runtime che monta il DC.
- `source/Divergify Hero Directions.dc.html` — le 3 art direction dell'hero a confronto (01 Second Nature, 02 The Cockpit ← scelta, 03 On Your Side). Solo riferimento.
- `divergify-design-brief.md` — il brief originale del committente (vincoli, audience, tono, prezzi).

Il compito, se l'utente vuole una build "vera": **ricreare questo design nell'ambiente del prodotto** (lo stack dell'app è React 19 + Vite + Tailwind v4 + Framer Motion, copy bilingue via `translations.js` chiavi `landing.*`, prezzi da `src/lib/payments/plans.js`), usando i pattern esistenti — non spedire l'HTML del prototipo.

## Fidelity
**Hi-fi.** Colori, tipografia, spaziature e interazioni sono definitivi. Le immagini e gli screenshot del prodotto sono **placeholder a righe con didascalia monospace** (es. `[ warm portrait — ... ]`, `[ product screenshot — ... ]`): vanno sostituiti con foto reali di persone (luce calda, colore naturale) e screenshot reali della dashboard.

---

## Deploy su Vercel

> **Quale opzione scegliere.** Se il sito dovrà essere **modificato e fatto crescere nel tempo** (nuove sezioni, copy, A/B, immagini reali, form), usa l'**Opzione B (React/Vite)**: il codice resta pulito e ogni modifica futura — con Claude Code o a mano — è naturale e manutenibile. L'**Opzione A** è solo per andare online subito: il file standalone è compilato/inlinato, quindi modificabile ma scomodo da mantenere — adatto a una preview o a ritocchi occasionali, non all'evoluzione del prodotto.

### Opzione A — Quick deploy (statico, immediato)
Mette online il prototipo così com'è. Ideale per una preview/early-access page veloce.

1. Crea una cartella di deploy con il file standalone come `index.html`:
   ```bash
   mkdir -p divergify-deploy
   cp design_handoff_divergify_site/divergify-site.html divergify-deploy/index.html
   cd divergify-deploy
   ```
2. Deploy:
   ```bash
   npm i -g vercel        # se non già installato
   vercel                 # preview deploy (segui i prompt: scope, project name "divergify")
   vercel --prod          # promozione a produzione
   ```
   Nessun build step necessario: è un sito statico a singolo file. Vercel servirà `index.html` dalla root. (Opzionale `vercel.json`: non serve per un singolo statico.)
3. Dominio: collega il dominio del committente in **Vercel → Project → Settings → Domains**.

> Limite: il file è un singolo HTML, i link CTA puntano a `#cta` (ancore) — non c'è ancora un form waitlist funzionante né backend. Vedi "TODO funzionali".

### Opzione B — Build reale in React/Vite (consigliata per produzione)
Coerente con lo stack dell'app esistente. Ricrea i 13 blocchi come componenti React, sposta il copy in `translations.js` (chiavi `landing.*`, EN+IT), i prezzi da `src/lib/payments/plans.js`, animazioni discrete con Framer Motion (rispetta `prefers-reduced-motion`). Poi:
```bash
# nel repo dell'app (o un nuovo progetto Vite)
vercel link        # collega al progetto Vercel
vercel --prod      # build & deploy (Vercel rileva Vite in automatico)
```
Framework preset su Vercel: **Vite** (build `vite build`, output `dist`).

### TODO funzionali (entrambe le opzioni)
- **Form waitlist / early access**: i bottoni "Enter early access" ora sono ancore a `#cta`. Collegare a un provider (es. form → email/CRM, o una route serverless su Vercel).
- **Lingua**: default dovrebbe seguire la lingua del browser (come l'app); ora il default è EN con toggle manuale.
- **Immagini reali** al posto dei placeholder.
- **Analytics/SEO**: aggiungere meta tag, OG image, `<title>`, e Vercel Analytics se desiderato.

---

## Screens / Views — i 13 blocchi
Tutto a pagina singola, max-width contenuto **1240px**, padding orizzontale **64px** (24px sotto 880px). Sezioni full-bleed, separate da `border-bottom: 1px solid rgba(239,233,221,.1)`. Padding verticale sezioni **120px** (hero/manifesto/CTA leggermente diversi).

1. **Nav** — sticky, `top:0`, bg `rgba(27,24,21,.86)` + `backdrop-filter:blur(12px)`. Logo "Divergify" + dot viola; link Product/How it works/Pricing/Manifesto (ancore); toggle EN/IT; CTA pill viola. Su mobile i link si nascondono (`.r-nav-links`).
2. **Hero** — grid `1.12fr / .88fr`. Sx: kicker mono viola, H1 66px Space Grotesk ("Everything that matters, on **one screen** — finally." / IT), sub, CTA primario + "Watch the 60s tour". Dx: placeholder ritratto 480px + card prodotto flottante (mini griglia widget) in basso-sx. Sotto: **cockpit band** (status pills mono: Today · Next 14:30 · Big 3 1/3 · Inbox 2 · 18° clear) con dot colorati semantici.
3. **Trust strip** — riga: "3,000+" (Space Grotesk 34px) + label waitlist; citazione tester; badge "Built by an ADHD founder" con dot verde.
4. **The problem** (sfondo **cream `#f4eee2`**, testo `#211f1b`) — grid `1.05fr/.95fr`. H2 52px "Ten apps open. Still nothing done."; 3 pain point numerati (01–03, ruled); placeholder foto scrivania caotica.
5. **How it works** — kicker + H2 48px; 3 colonne (`.r-3col`) con numero 40px viola, rule top viola 2px, titolo 24px, descrizione. Step: Dump everything / See what matters / Do one thing.
6. **Widget showcase** (`#product`) — centrato. H2 "Your whole stack, on one screen."; placeholder grande dashboard 560px; sotto, chip mono dei widget (Gmail, Calendar, To-Do, Brain Dump, AI Chat, Weather, Pomodoro, Mood & Energy, Habits).
7. **Built for your brain** — lista editoriale a **righe ruled** (NON card): grid `.8fr/1.2fr` per riga, nome + tag pill colorato a sx, descrizione a dx. 6 feature: Cockpit, Big 3, Chunk-it (AI·Claude), Brain Dump, One-thing focus, Energy × Time.
8. **Manifesto** (`#manifesto`, sfondo **cream**) — max-width 1000px. Statement 40px Space Grotesk weight 500 con parole-chiave in verde; chiusura mono.
9. **Personalization** — grid `1fr/1fr`. Sx testo; dx pannello "preferences" mock: chip temi (Light / Cream / **Total Black** selezionato), swatch accento (6 colori, viola attivo con outline), chip tratteggiati Drag / Pin·max 6 / Dilate / IT·EN.
10. **Pricing** (`#pricing`) — 2 piani (max-width 900px): **Free €0** (Up to 4 widgets · 1 theme · Local sync) e **Pro €6/mese** evidenziato (bordo viola, badge "Most popular": Unlimited widgets · all themes + custom colours · multi-device cloud sync · premium widgets coming). Riga metodi: "Pay with card (Stripe) or crypto · cancel anytime". **Non inventare prezzi diversi** (da brief §7).
11. **FAQ** — `<details>/<summary>` nativi (no JS, accessibili), max-width 860px. 5 domande: privacy dati, "funziona senza ADHD?", device, diagnosi necessaria?, disdetta. Icona "+" ruota a 45° quando aperto.
12. **Final CTA** (`#cta`, sfondo **viola `#8f78ff`**, testo scuro `#1b1043`) — centrato. H2 58px "Give your brain a second one."; CTA scuro + "3,000+ already in".
13. **Footer** — grid 4 colonne (Brand + Product + Company + Legal); barra inferiore con copyright, email `hello@divergify.app`, toggle EN/IT.

## Interactions & Behavior
- **Toggle lingua EN/IT**: unico stato `lang` ('en' default). Tutta la copy è doppia nel DOM; CSS mostra/nasconde via `[data-lang="it"] .lang-en{display:none}` ecc. Su `data-lang` dell'elemento root. Bottoni in nav e footer.
- **Nav sticky** con blur.
- **FAQ**: espansione nativa `<details>`; transizione rotazione "+" 0.2s.
- **Hover**: i link non hanno stati hover espliciti nel prototipo (da aggiungere in produzione, sottili).
- **Responsive** (`@media max-width:880px`): grid → 1 colonna, link nav nascosti (serve menu mobile in produzione), padding 24px, H1 → 42px, alcune righe in colonna.
- **Accessibilità ADHD-aware** (vincolo brief §6): basso carico cognitivo, contrasto alto, niente animazioni che lampeggiano, rispettare `prefers-reduced-motion`, CTA sempre chiarissima.

## State Management
Minimo: una sola variabile `lang` ('en' | 'it'). In produzione: inizializzare da `navigator.language`, persistere la scelta, e integrare con il sistema i18n esistente (`translations.js`, chiavi `landing.*`).

## Design Tokens
**Colori**
- Sfondo primario (dark warm): `#1b1815`
- Pannelli scuri: `#252019`, `#272219`, `#2a251d`, `#352f25`
- Sfondo alternato (cream): `#f4eee2` (ink `#211f1b`, muted `#4a463f`)
- Accento primario (viola, flat): `#8f78ff` (ink su viola `#1b1043`)
- Testo su scuro: primario `#efe9dd`, muted `#b8b1a4` / `#cfc8ba`, mono-muted `#9a9183`
- Bordi su scuro: `rgba(239,233,221,.10–.16)`; su cream: `rgba(33,31,27,.08–.16)`
- Accenti semantici (solo dot/tag): verde `#2fb380`, ambra `#f0a132`, ciano `#22b8cf`, rosa `#e864c4`, arancio `#f97316`
- **Niente gradienti** (le righe diagonali nei placeholder sono solo segnaposto, non grafica finale).

**Tipografia** (Google Fonts)
- Display: **Space Grotesk** (600) — H1 66px, H2 44–52px, prezzi 52px
- Testo: **Spline Sans** (400/500/600) — body 17–20px, line-height ~1.55
- Label/kicker/mono: **IBM Plex Mono** (500) — 11–13px, letter-spacing .04–.2em, uppercase
- Letter-spacing display: da -.02 a -.025em

**Raggi**: pill `999px`; card/sezioni-interne `14–20px`; chip `8px`.
**Spaziatura**: container 1240px / pad 64px; sezioni 120px verticali; gap griglie 24–64px.
**Shadow**: card prodotto flottante `0 22px 48px rgba(0,0,0,.5)`.

## Assets
Nessuna immagine reale: tutti placeholder a righe diagonali con didascalia monospace tra parentesi quadre. Da fornire:
- Ritratti reali di persone (hero, problema, On Your Side) — luce calda, naturali, no stock finto-felice.
- Screenshot reali della dashboard prodotto (sezione 6) e di un widget-grid in miniatura (card hero).
- Font: Space Grotesk, Spline Sans, IBM Plex Mono (Google Fonts; nel file standalone sono inlinati).
- Logo: wordmark testuale "Divergify" + dot viola (nessun logo grafico separato).

## Files
- `divergify-site.html` — standalone deployabile (Opzione A).
- `source/Divergify Site.dc.html` — sorgente design (template + logica).
- `source/support.js` — runtime per il sorgente .dc.html.
- `source/Divergify Hero Directions.dc.html` — 3 art direction hero (riferimento).
- `divergify-design-brief.md` — brief committente.
