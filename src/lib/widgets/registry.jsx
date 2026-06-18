import { Mail, Calendar, CheckSquare, StickyNote, Cloud, Clock, Sparkles } from "lucide-react";

/*
  DiVerge — Widget registry.

  Every widget DiVerge can show is declared here once. The dashboard reads
  this catalog to render the grid and the "add widget" picker.

  Today these are PLACEHOLDERS (status: "soon") with no real integration.
  In Phase 3 each one gets a real component + connection (e.g. Gmail via the
  Google API). To add a widget later you only touch this file + its component.
*/

export const WIDGETS = {
  gmail: {
    id: "gmail",
    name: "Gmail",
    description: "Le tue email più recenti, a colpo d'occhio.",
    icon: Mail,
    accent: "#ea4335",
    status: "live",
    size: "md",
  },
  calendar: {
    id: "calendar",
    name: "Calendario",
    description: "I prossimi impegni dalla tua agenda Google.",
    icon: Calendar,
    accent: "#4285f4",
    status: "live",
    size: "md",
  },
  tasks: {
    id: "tasks",
    name: "To-Do",
    description: "Una lista semplice per non perdere il filo.",
    icon: CheckSquare,
    accent: "#2fb380",
    status: "soon",
    size: "sm",
  },
  notes: {
    id: "notes",
    name: "Note rapide",
    description: "Cattura un pensiero prima che voli via.",
    icon: StickyNote,
    accent: "#f0a132",
    status: "soon",
    size: "sm",
  },
  weather: {
    id: "weather",
    name: "Meteo",
    description: "Uno sguardo veloce al cielo di oggi.",
    icon: Cloud,
    accent: "#22b8cf",
    status: "soon",
    size: "sm",
  },
  focus: {
    id: "focus",
    name: "Timer Focus",
    description: "Sessioni di concentrazione in stile Pomodoro.",
    icon: Clock,
    accent: "#e864c4",
    status: "live",
    size: "sm",
  },
  ai: {
    id: "ai",
    name: "Assistente AI",
    description: "Chatta con un modello AI a tua scelta. Aggiungine più di uno!",
    icon: Sparkles,
    accent: "#7c5cff",
    status: "live",
    size: "md",
    multiInstance: true, // the user can add several, each with its own model
  },
};

export const WIDGET_LIST = Object.values(WIDGETS);

// Which widgets a brand-new user starts with.
export const DEFAULT_LAYOUT = ["gmail", "calendar", "ai::main", "focus"];

/*
  Instance ids vs. types.
  Most widgets are singletons: their instance id IS the type ("gmail").
  Multi-instance widgets (AI) use "<type>::<uuid>" so several can coexist.
*/
export function instanceType(instanceId) {
  return instanceId.includes("::") ? instanceId.split("::")[0] : instanceId;
}

export function isMultiInstance(type) {
  return Boolean(WIDGETS[type]?.multiInstance);
}

export function newInstanceId(type) {
  return isMultiInstance(type)
    ? `${type}::${crypto.randomUUID().slice(0, 8)}`
    : type;
}
