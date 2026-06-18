// DiVerge mark: two paths diverging from a single point.
export default function Logo({ size = 34 }) {
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
          stroke="var(--color-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M16 16 C16 16 16 8 7 4"
          stroke="var(--color-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M16 16 C16 16 16 8 25 4"
          stroke="var(--color-content)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      <span className="text-xl font-semibold tracking-tight">
        Di<span className="text-accent">Verge</span>
      </span>
    </span>
  );
}
