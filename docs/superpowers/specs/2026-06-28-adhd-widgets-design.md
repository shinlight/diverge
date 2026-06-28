# ADHD strategic widgets (mocks) — design

Date: 2026-06-28

Three new dashboard widgets chosen to cover the core ADHD-neurotype pain points
the app didn't yet address. Built autonomously as **mocks pending the user's
judgment** — any of them may be removed after review. All are fully local (no
backend, no keys); each follows the `service + hook + Widget + Focus` template
and persists to localStorage.

## Rationale (ADHD pillars → widget)
- **Routine + dopamine / consistency** → **Habits** (daily check-offs with streaks).
- **Emotional regulation / interoception** → **Mood & Energy** (quick check-ins + history).
- **Task initiation / dysregulation / anti-doomscroll** → **Dopamine Menu**
  (small actions picked by energy level).

These are mechanically distinct from each other and from existing widgets
(To-Do = one-off tasks, Focus Timer = Pomodoro, Brain Dump = capture).

## 1. Habits  (id `habits`, icon Flame, accent `#f97316`)
- `habitsService.js`: habits `{id, name, emoji, history: [YYYY-MM-DD]}`, streak
  computation (counts back from today; an unchecked today doesn't break it),
  localStorage `diverge.habits`, seeded.
- `useHabits.js`: list, `toggleToday`, `add`, `remove`, `doneToday`.
- Card: today's check circle + emoji + name + streak flame; "x/total done today".
- Focus: full list with last-7-day dots + streak, add (emoji + name), delete.

## 2. Mood & Energy  (id `mood`, icon Smile, accent `#ec4899`)
- `moodService.js`: entries `{id, mood 1-5, energy 1-5|null, note, ts}`, `MOODS`
  scale, localStorage `diverge.mood`, seeded.
- `useMood.js`: entries (newest first), `latest`, `trend` (last 7), `addEntry`, `remove`.
- Card: "How are you?" 5-emoji one-tap quick-log (energy null) + latest + mini trend bars.
- Focus: full check-in (mood + energy 1-5 + note + save) and history list.

## 3. Dopamine Menu  (id `dopamine`, icon Zap, accent `#eab308`, wide)
- `dopamineService.js`: activities `{id, emoji, label, energy: low|med|high,
  minutes}`, `pickRandom(energy)`, per-day "done" counter, localStorage
  `diverge.dopamine.list` + `diverge.dopamine.done`, seeded (~14 actions, IT).
- `useDopamine.js`: activities, `suggestion`, `filter`, `doneToday`, `shuffle`,
  `choose`, `markDone`, `add`, `remove`.
- Card: energy filter (all/low/med/high), suggestion card, "Surprise me" + "Done".
- Focus: current suggestion, menu grouped by energy, add custom (emoji + label +
  energy + minutes), remove.

## Wiring
- Registered in `registry.jsx` and mapped in `live/index.js`.
- i18n EN + IT blocks (`habits`, `mood`, `dopamine`) + `widgets.<id>.name/desc`.

## StrictMode safety
Each hook persists via a `useEffect` on state with a skip-first-render ref —
never a side-effect inside a `setState` updater (project gotcha).

## How to remove a widget (if it doesn't pass review)
Delete `src/lib/widgets/<id>/` + `src/components/widgets/live/<Id>Widget.jsx` +
`<Id>Focus.jsx`, then remove its entry from `registry.jsx`, its import + map line
from `live/index.js`, and its `<id>` block + `widgets.<id>` line (EN & IT) from
`translations.js`.

## Out of scope (YAGNI)
- Cross-device sync (Supabase), notifications/reminders, analytics/charts beyond
  the mini trend, cross-widget events.

## Verify
- `npm run build` green; `preview_console_logs` (error) clean.
- Mock flow: add each widget → interact (toggle / check-in / shuffle+done) →
  state persists in localStorage.
