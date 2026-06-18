import { useTheme } from "../../lib/theme/ThemeContext";

// DiVerge mark: two paths diverging from a single point.
export default function Logo({ size = 34 }) {
  const { mono } = useTheme();
  const brand = mono ? "#ffffff" : "var(--color-accent)";
  const secondary = mono ? "#ffffff" : "var(--color-content)";

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 28 L16 16"
          stroke={brand}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M16 16 C16 16 16 8 7 4"
          stroke={brand}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity={mono ? 1 : 0.85}
        />
        <path
          d="M16 16 C16 16 16 8 25 4"
          stroke={secondary}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity={mono ? 1 : 0.55}
        />
      </svg>
      <span className="text-xl font-semibold tracking-tight">
        Di<span className={mono ? "" : "text-accent"}>Verge</span>
      </span>
    </span>
  );
}
