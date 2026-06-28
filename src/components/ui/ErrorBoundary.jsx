import { Component } from "react";
import { AlertTriangle } from "lucide-react";

/*
  DiVerge — Error Boundary.

  React error boundaries MUST be class components. Without one, a single render
  error anywhere unmounts the whole tree → blank white page. We use this per
  widget (so one bad widget shows an inline error instead of blanking the whole
  dashboard) and once at the app root as a safety net.

  It also logs which boundary failed + the error, so a crash is diagnosable from
  the browser console instead of being an invisible white screen.
*/
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(
      `[DiVerge] Crash${this.props.label ? ` in "${this.props.label}"` : ""}:`,
      error,
      info?.componentStack
    );
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-2 p-5 text-center">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertTriangle size={20} />
        </span>
        <p className="text-sm font-medium">{this.props.label || "Widget"}</p>
        <p className="max-h-24 overflow-y-auto break-words text-xs text-muted">
          {String(error?.message || error)}
        </p>
        <button
          onClick={this.reset}
          className="mt-1 text-sm font-medium text-accent hover:underline"
        >
          {this.props.retryLabel || "Retry"}
        </button>
      </div>
    );
  }
}
