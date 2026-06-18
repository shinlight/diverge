import {
  Cloud,
  Sun,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
  RefreshCw,
  Loader2,
  Droplets,
  Wind,
  AlertCircle,
} from "lucide-react";
import { useWeather } from "../../../lib/widgets/weather/useWeather";
import { codeKey } from "../../../lib/widgets/weather/weatherService";
import { useI18n } from "../../../lib/i18n/LanguageContext";
import WidgetHeader from "../WidgetHeader";

const ACCENT = "#22b8cf";

const ICONS = {
  clear: Sun,
  mainlyClear: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  showers: CloudRain,
  thunder: CloudLightning,
};

function CodeIcon({ code, size, className }) {
  const Icon = ICONS[codeKey(code)] ?? Cloud;
  return <Icon size={size} className={className} />;
}

export default function WeatherWidget({ title, onRename }) {
  const { t, lang } = useI18n();
  const w = useWeather();

  const dayName = (d) =>
    new Date(d).toLocaleDateString(lang === "it" ? "it-IT" : "en-US", {
      weekday: "short",
    });

  return (
    <div className="flex h-full flex-col p-5">
      <WidgetHeader
        icon={Cloud}
        iconColor={ACCENT}
        title={title}
        onRename={onRename}
        subtitle={w.status === "ready" ? w.data.place ?? t("weather.yourLocation") : undefined}
        actions={
          w.status === "ready" ? (
            <button
              onClick={w.refresh}
              aria-label={t("common.refresh")}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted
                transition-colors hover:bg-surface-2 hover:text-content"
            >
              <RefreshCw size={15} />
            </button>
          ) : null
        }
      />

      <div className="min-h-[150px] flex-1">
        {w.status === "idle" ? (
          <Prompt
            onShare={w.locate}
            title={t("weather.shareTitle")}
            desc={t("weather.shareDesc")}
            cta={t("weather.share")}
          />
        ) : w.status === "locating" || w.status === "loading" ? (
          <Centered>
            <Loader2 size={20} className="animate-spin text-muted" />
            <span>{w.status === "locating" ? t("weather.locating") : t("common.loading")}</span>
          </Centered>
        ) : w.status === "denied" ? (
          <Centered>
            <MapPin size={20} className="text-muted" />
            <span>{t("weather.denied")}</span>
            <button onClick={w.locate} className="mt-1 text-sm font-medium text-accent hover:underline">
              {t("weather.share")}
            </button>
          </Centered>
        ) : w.status === "error" ? (
          <Centered>
            <AlertCircle size={20} className="text-muted" />
            <span>{t("weather.error")}</span>
            <button onClick={w.refresh} className="mt-1 text-sm font-medium text-accent hover:underline">
              {t("common.retry")}
            </button>
          </Centered>
        ) : (
          <Ready data={w.data} t={t} dayName={dayName} />
        )}
      </div>
    </div>
  );
}

function Ready({ data, t, dayName }) {
  const c = data.current;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <CodeIcon code={c.code} size={52} className="shrink-0" />
        <div>
          <div className="text-4xl font-semibold leading-none tabular-nums">
            {c.temp}°
          </div>
          <div className="mt-1 text-xs text-muted">
            {t(`weatherCodes.${codeKey(c.code)}`)}
          </div>
        </div>
        <div className="ml-auto space-y-1 text-right text-xs text-muted">
          <p className="flex items-center justify-end gap-1">
            <Droplets size={12} /> {t("weather.humidity")} {c.humidity}%
          </p>
          <p className="flex items-center justify-end gap-1">
            <Wind size={12} /> {t("weather.wind")} {c.wind} km/h
          </p>
          <p>{t("weather.feelsLike", { t: c.feels })}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
        {data.daily.slice(1, 4).map((d) => (
          <div
            key={d.date}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface-2/40 py-2.5"
          >
            <span className="text-xs capitalize text-muted">{dayName(d.date)}</span>
            <CodeIcon code={d.code} size={20} />
            <span className="text-xs tabular-nums">
              <span className="font-medium">{d.max}°</span>{" "}
              <span className="text-muted">{d.min}°</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Prompt({ onShare, title, desc, cta }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
      >
        <MapPin size={22} />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-[220px] text-xs text-muted">{desc}</p>
      <button
        onClick={onShare}
        className="mt-1 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm
          font-medium text-white"
        style={{ backgroundColor: ACCENT }}
      >
        <MapPin size={15} /> {cta}
      </button>
    </div>
  );
}

function Centered({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
      {children}
    </div>
  );
}
