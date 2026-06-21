import { useEffect, useRef, useState } from "react";
import {
  Gauge,
  CalendarDays,
  Clock,
  ListTodo,
  Mail,
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";
import { useCockpit } from "../../lib/cockpit/useCockpit";
import { useI18n } from "../../lib/i18n/LanguageContext";
import { codeKey } from "../../lib/widgets/weather/weatherService";

// A pinned, non-removable summary strip above the widget grid.
// Background is a faint pastel of the user's accent; height tracks 50% of a
// widget cell at the current breakpoint.

const BG = "color-mix(in srgb, var(--color-accent) 10%, var(--color-bg))";
const BORDER = "color-mix(in srgb, var(--color-accent) 24%, var(--color-bg))";

function colsForWidth(w) {
  if (w >= 1536) return 5;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

const WEATHER_ICON = {
  clear: Sun,
  mainlyClear: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: CloudRain,
  snow: CloudSnow,
  thunder: CloudLightning,
};

export default function Cockpit() {
  const { t, lang } = useI18n();
  const { now, nextEvent, unread, google, weather, tasks } = useCockpit();
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  // Height = half a widget cell: (width − gaps) / columns / 2.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const cols = colsForWidth(window.innerWidth);
      // On mobile (1 column) half a widget is too short for the cells → let
      // the Cockpit size to its content instead. On sm+ it's a neat strip.
      if (cols === 1) {
        setHeight(0);
        return;
      }
      const cell = (el.clientWidth - (cols - 1) * 16) / cols;
      setHeight(Math.max(96, Math.round(cell / 2)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cells = {
    date: <DateCell now={now} lang={lang} t={t} />,
    next: <NextCell now={now} event={nextEvent} google={google} lang={lang} t={t} />,
    todo: <TodoCell tasks={tasks} t={t} />,
    mail: <MailCell unread={unread} google={google} t={t} />,
    weather: <WeatherCell weather={weather} lang={lang} t={t} />,
  };

  return (
    <section
      ref={ref}
      style={{ height: height || undefined, background: BG, borderColor: BORDER }}
      className="relative mb-4 w-full overflow-hidden rounded-2xl border min-h-[96px]"
    >
      <span className="pointer-events-none absolute left-4 top-2.5 z-10 flex items-center gap-1
        text-[10px] font-semibold uppercase tracking-[0.18em] text-accent/70">
        <Gauge size={11} /> {t("cockpit.title")}
      </span>

      {/* Desktop: one horizontal strip */}
      <div className="hidden h-full items-center px-4 sm:flex">
        {cells.date}
        <Divider />
        {cells.next}
        <Divider />
        {cells.todo}
        <Divider />
        {cells.mail}
        <Divider />
        {cells.weather}
      </div>

      {/* Mobile: 2-column grid, To-Do full width (content-height) */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 px-4 pb-4 pt-7 sm:hidden">
        {cells.date}
        {cells.next}
        {cells.mail}
        {cells.weather}
        <div className="col-span-2">{cells.todo}</div>
      </div>
    </section>
  );
}

function Divider() {
  return <span className="mx-1 h-9 w-px shrink-0 bg-line/60" />;
}

function Stat({ icon: Icon, label, value, sub, flex = "flex-1" }) {
  return (
    <div className={`flex min-w-0 ${flex} flex-col justify-center gap-0.5 px-2`}>
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
        <Icon size={13} /> {label}
      </span>
      <span className="truncate text-lg font-semibold leading-tight">{value}</span>
      {sub != null && <span className="truncate text-xs text-muted">{sub}</span>}
    </div>
  );
}

const localeOf = (lang) => (lang === "it" ? "it-IT" : "en-US");
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function DateCell({ now, lang, t }) {
  const loc = localeOf(lang);
  return (
    <Stat
      icon={CalendarDays}
      label={t("cockpit.today")}
      value={cap(now.toLocaleDateString(loc, { weekday: "long" }))}
      sub={now.toLocaleDateString(loc, { day: "numeric", month: "long" })}
    />
  );
}

function NextCell({ now, event, google, lang, t }) {
  const loc = localeOf(lang);
  const time = now.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });

  let sub;
  if (event) {
    sub = `→ ${event.title} · ${whenLabel(event, now, loc, t)}`;
  } else if (google === "ready") {
    sub = t("cockpit.noEvents");
  } else {
    sub = "—";
  }
  return <Stat icon={Clock} label={t("cockpit.now")} value={time} sub={sub} />;
}

function whenLabel(event, now, loc, t) {
  if (event.allDay) return t("cockpit.allDay");
  const start = new Date(event.start);
  const diffMin = Math.round((start - now) / 60000);
  if (diffMin <= 0) return t("cockpit.now");
  if (diffMin < 90) return t("cockpit.inMin", { n: diffMin });
  return start.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
}

function TodoCell({ tasks, t }) {
  return (
    <div className="flex min-w-0 flex-[1.6] flex-col justify-center gap-0.5 px-2">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
        <ListTodo size={13} /> {t("cockpit.todo")}
      </span>
      {tasks.length === 0 ? (
        <span className="truncate text-sm text-muted">{t("cockpit.allClear")}</span>
      ) : (
        <ul className="space-y-0.5">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: task.color }}
              />
              <span className="truncate text-sm">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MailCell({ unread, google, t }) {
  const value = google === "ready" && unread != null ? unread : "—";
  return (
    <Stat icon={Mail} label="Email" value={value} sub={t("cockpit.unread")} />
  );
}

function WeatherCell({ weather, lang, t }) {
  const c = weather?.current;
  const Icon = c ? WEATHER_ICON[codeKey(c.code)] || Cloud : Cloud;
  return (
    <Stat
      icon={Icon}
      label={t("cockpit.weather")}
      value={c ? `${c.temp}°` : "—"}
      sub={c ? weather.place || `${c.feels}°` : "—"}
    />
  );
}
