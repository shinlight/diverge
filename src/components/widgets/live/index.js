// Maps a widget id to its live React component.
// A widget listed here renders its real UI; others show the "coming soon" card.
// To bring a widget to life later: build its component and add it here.
import GmailWidget from "./GmailWidget";
import CalendarWidget from "./CalendarWidget";
import FocusWidget from "./FocusWidget";
import AIWidget from "./AIWidget";

export const LIVE_WIDGETS = {
  gmail: GmailWidget,
  calendar: CalendarWidget,
  focus: FocusWidget,
  ai: AIWidget,
};
