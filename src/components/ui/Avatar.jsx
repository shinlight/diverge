// Avatar with graceful fallback to the nickname's initials.
function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "·";
}

export default function Avatar({ user, size = 40, className = "" }) {
  const dimension = { width: size, height: size };

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.nickname ?? "avatar"}
        style={dimension}
        className={`rounded-full object-cover ring-2 ring-line ${className}`}
      />
    );
  }

  return (
    <div
      style={dimension}
      className={`grid place-items-center rounded-full bg-accent text-accent-contrast
        font-semibold ring-2 ring-line ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initials(user?.nickname)}</span>
    </div>
  );
}
