// Shared bits for the admin sections: stat cards, status badges, section shell.

export function StatCard({ icon: Icon, label, value, sub, accent = "var(--color-accent)" }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2 text-muted">
        {Icon && (
          <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ backgroundColor: `${accent}1a`, color: accent }}>
            <Icon size={15} />
          </span>
        )}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

const TONES = {
  green: "bg-green-500/12 text-green-500",
  red: "bg-red-500/12 text-red-400",
  amber: "bg-amber-500/12 text-amber-500",
  gray: "bg-surface-2 text-muted",
  accent: "bg-accent/12 text-accent",
};

export function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone] || TONES.gray}`}>
      {children}
    </span>
  );
}

export function SectionShell({ title, subtitle, actions, children }) {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

// Tiny dependency-free bar chart for the signups trend.
export function MiniBars({ data, accent = "var(--color-accent)" }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-24 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d.count}`}>
          <div
            className="w-full rounded-t"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: 2, backgroundColor: accent, opacity: 0.5 + (i / data.length) * 0.5 }}
          />
        </div>
      ))}
    </div>
  );
}
