import { motion } from "framer-motion";

const VARIANTS = {
  accent:
    "bg-accent text-accent-contrast hover:brightness-110 shadow-sm shadow-black/20",
  surface:
    "bg-surface-2 text-content hover:bg-surface-2/70 border border-line",
  ghost: "text-muted hover:text-content hover:bg-surface-2/60",
  outline: "border border-line text-content hover:bg-surface-2/60",
};

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export default function Button({
  variant = "surface",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center font-medium select-none
        transition-colors disabled:opacity-50 disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
