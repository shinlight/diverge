import { Mail, Calendar, CheckSquare, StickyNote, Cloud, Clock, Sparkles, ClipboardList, MessageCircle, BrainCircuit } from "lucide-react";

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
    nameKey: "widgets.gmail.name",
    descKey: "widgets.gmail.desc",
    icon: Mail,
    accent: "#ea4335",
    status: "live",
    size: "md",
    wide: true, // can expand to 2 blocks
  },
  calendar: {
    id: "calendar",
    nameKey: "widgets.calendar.name",
    descKey: "widgets.calendar.desc",
    icon: Calendar,
    accent: "#4285f4",
    status: "live",
    size: "md",
    wide: true,
  },
  tasks: {
    id: "tasks",
    nameKey: "widgets.tasks.name",
    descKey: "widgets.tasks.desc",
    icon: CheckSquare,
    accent: "#2fb380",
    status: "live",
    size: "sm",
    wide: true,
  },
  notes: {
    id: "notes",
    nameKey: "widgets.notes.name",
    descKey: "widgets.notes.desc",
    icon: StickyNote,
    accent: "#f0a132",
    status: "live",
    size: "md",
  },
  weather: {
    id: "weather",
    nameKey: "widgets.weather.name",
    descKey: "widgets.weather.desc",
    icon: Cloud,
    accent: "#22b8cf",
    status: "live",
    size: "sm",
  },
  focus: {
    id: "focus",
    nameKey: "widgets.focus.name",
    descKey: "widgets.focus.desc",
    icon: Clock,
    accent: "#e864c4",
    status: "live",
    size: "sm",
  },
  ai: {
    id: "ai",
    nameKey: "widgets.ai.name",
    descKey: "widgets.ai.desc",
    icon: Sparkles,
    accent: "#7c5cff",
    status: "live",
    size: "md",
    wide: true,
    multiInstance: true, // the user can add several, each with its own model
  },
  clipboard: {
    id: "clipboard",
    nameKey: "widgets.clipboard.name",
    descKey: "widgets.clipboard.desc",
    icon: ClipboardList,
    accent: "#14b8a6",
    status: "live",
    size: "md",
  },
  messaging: {
    id: "messaging",
    nameKey: "widgets.messaging.name",
    descKey: "widgets.messaging.desc",
    icon: MessageCircle,
    accent: "#0ea5e9",
    status: "live",
    size: "md",
    wide: true,
    multiInstance: true, // one widget per channel; several can coexist
  },
  braindump: {
    id: "braindump",
    nameKey: "widgets.braindump.name",
    descKey: "widgets.braindump.desc",
    icon: BrainCircuit,
    accent: "#a855f7",
    status: "live",
    size: "sm",
  },
};

export const WIDGET_LIST = Object.values(WIDGETS);

// Which widgets a brand-new user starts with.
export const DEFAULT_LAYOUT = ["gmail", "calendar", "tasks", "braindump", "ai::main", "focus"];

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
