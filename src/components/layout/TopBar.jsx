import { Link } from "react-router-dom";
import { Palette } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../ui/Logo";
import Avatar from "../ui/Avatar";
import NotificationsBell from "../notifications/NotificationsBell";
import { useAuth, displayName } from "../../lib/auth/AuthContext";

export default function TopBar({ onOpenTheme }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="rounded-lg">
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenTheme}
            aria-label="Personalizza tema"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted
              transition-colors hover:bg-surface-2/60 hover:text-content"
          >
            <Palette size={20} />
          </motion.button>

          <NotificationsBell />

          <Link
            to="/profilo"
            aria-label="Vai al profilo"
            className="flex items-center gap-2.5 rounded-full pl-2 transition-opacity hover:opacity-80"
          >
            <span className="hidden max-w-[140px] truncate text-sm font-medium sm:block">
              {displayName(user)}
            </span>
            <Avatar user={user} size={38} />
          </Link>
        </div>
      </div>
    </header>
  );
}
