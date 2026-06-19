import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Maximize, Minimize } from "lucide-react";
import { useI18n } from "../../lib/i18n/LanguageContext";

// Toggles real browser fullscreen (hides all browser chrome) for an
// immersive, distraction-free view. Must be triggered by a user gesture.
export default function FullscreenButton() {
  const { t } = useI18n();
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      aria-label={isFs ? t("toolbar.exitFullscreen") : t("toolbar.fullscreen")}
      title={isFs ? t("toolbar.exitFullscreen") : t("toolbar.fullscreen")}
      className="grid h-10 w-10 place-items-center rounded-xl text-muted
        transition-colors hover:bg-surface-2/60 hover:text-content"
    >
      {isFs ? <Minimize size={20} /> : <Maximize size={20} />}
    </motion.button>
  );
}
