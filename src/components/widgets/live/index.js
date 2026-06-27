// Maps a widget id to its live React component.
// A widget listed here renders its real UI; others show the "coming soon" card.
// To bring a widget to life later: build its component and add it here.
import GmailWidget from "./GmailWidget";
import CalendarWidget from "./CalendarWidget";
import TasksWidget from "./TasksWidget";
import FocusWidget from "./FocusWidget";
import AIWidget from "./AIWidget";
import WeatherWidget from "./WeatherWidget";
import NotesWidget from "./NotesWidget";
import ClipboardWidget from "./ClipboardWidget";
import MessagingWidget from "./MessagingWidget";
import BrainDumpWidget from "./BrainDumpWidget";
import ImapWidget from "./ImapWidget";
import RevolutWidget from "./RevolutWidget";

export const LIVE_WIDGETS = {
  gmail: GmailWidget,
  calendar: CalendarWidget,
  tasks: TasksWidget,
  focus: FocusWidget,
  ai: AIWidget,
  weather: WeatherWidget,
  notes: NotesWidget,
  clipboard: ClipboardWidget,
  messaging: MessagingWidget,
  braindump: BrainDumpWidget,
  imap: ImapWidget,
  revolut: RevolutWidget,
};
