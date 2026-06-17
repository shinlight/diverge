import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  RefreshCw,
  X,
  Trash2,
  Save,
  MapPin,
  Clock,
  CalendarClock,
} from "lucide-react";
import {
  timeRange,
  groupByDay,
  toLocalInput,
  fromLocalInput,
  defaultNewEvent,
  EVENT_COLORS,
} from "../../../lib/widgets/calendar/calendarService";

const ACCENT = "#4285f4";

export default function CalendarFocus({
  open,
  onClose,
  calendar,
  initialSelectedId,
  initialCreate,
}) {
  const { events, status, refresh, create, update, remove } = calendar;
  const [selectedId, setSelectedId] = useState(initialSelectedId ?? null);
  const [mode, setMode] = useState("idle"); // idle | detail | create
  const selected = events.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (!open) return;
    if (initialCreate) {
      setMode("create");
      setSelectedId(null);
    } else if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      setMode("detail");
    }
  }, [open, initialSelectedId, initialCreate]);

  function openEvent(id) {
    setSelectedId(id);
    setMode("detail");
  }
  function startCreate() {
    setSelectedId(null);
    setMode("create");
  }
  async function handleDelete(id) {
    await remove(id);
    if (selectedId === id) {
      setSelectedId(null);
      setMode("idle");
    }
  }

  const groups = groupByDay(events);
  const paneActive = mode === "create" || (mode === "detail" && selected);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden
              border border-line bg-surface sm:h-[85vh] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
              >
                <Calendar size={18} />
              </span>
              <h2 className="text-base font-semibold">Calendario</h2>

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={startCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2
                    text-sm font-medium text-accent-contrast hover:brightness-110"
                >
                  <Plus size={16} /> Nuovo evento
                </button>
                <button
                  onClick={refresh}
                  disabled={status === "loading"}
                  aria-label="Aggiorna"
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted
                    hover:bg-surface-2 hover:text-content disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={status === "loading" ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Chiudi"
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted
                    hover:bg-surface-2 hover:text-content"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1">
              {/* Agenda */}
              <div
                className={`w-full shrink-0 overflow-y-auto border-r border-line sm:w-[340px]
                  ${paneActive ? "hidden sm:block" : "block"}`}
              >
                {events.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                    <Calendar size={20} />
                    Nessun evento
                  </div>
                ) : (
                  groups.map((g) => (
                    <div key={g.key}>
                      <p className="sticky top-0 bg-surface/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted backdrop-blur">
                        {g.label}
                      </p>
                      <ul>
                        {g.events.map((ev) => (
                          <AgendaRow
                            key={ev.id}
                            event={ev}
                            active={ev.id === selectedId && mode === "detail"}
                            onOpen={() => openEvent(ev.id)}
                          />
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              {/* Editor pane */}
              <div
                className={`min-h-0 flex-1 overflow-y-auto
                  ${paneActive ? "block" : "hidden sm:block"}`}
              >
                {mode === "create" ? (
                  <EventEditor
                    key="create"
                    initial={defaultNewEvent()}
                    onSave={async (data) => {
                      const created = await create(data);
                      setSelectedId(created.id);
                      setMode("detail");
                    }}
                    onCancel={() => setMode("idle")}
                  />
                ) : selected ? (
                  <EventEditor
                    key={selected.id}
                    initial={selected}
                    onSave={(data) => update(selected.id, data)}
                    onDelete={() => handleDelete(selected.id)}
                    onCancel={() => {
                      setSelectedId(null);
                      setMode("idle");
                    }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
                    <CalendarClock size={22} />
                    Seleziona un evento o creane uno nuovo
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AgendaRow({ event, active, onOpen }) {
  return (
    <li
      onClick={onOpen}
      className={`flex cursor-pointer items-start gap-3 border-b border-line/60 px-4 py-3
        transition-colors ${active ? "bg-surface-2/70" : "hover:bg-surface-2/40"}`}
    >
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: event.color }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{event.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} /> {timeRange(event.start, event.end)}
          {event.location && (
            <>
              <span className="opacity-50">·</span>
              <span className="truncate">{event.location}</span>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

function EventEditor({ initial, onSave, onDelete, onCancel }) {
  const [title, setTitle] = useState(initial.title);
  const [start, setStart] = useState(toLocalInput(initial.start));
  const [end, setEnd] = useState(toLocalInput(initial.end));
  const [location, setLocation] = useState(initial.location ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [color, setColor] = useState(initial.color ?? EVENT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(onDelete);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      title,
      start: fromLocalInput(start),
      end: fromLocalInput(end),
      location,
      notes,
      color,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3">
        <h3 className="text-sm font-semibold">
          {isEdit ? "Modifica evento" : "Nuovo evento"}
        </h3>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Elimina evento"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-content"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo dell'evento"
          autoFocus
          className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledField label="Inizio" icon={Clock}>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-transparent text-sm outline-none [color-scheme:dark]"
            />
          </LabeledField>
          <LabeledField label="Fine" icon={CalendarClock}>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-transparent text-sm outline-none [color-scheme:dark]"
            />
          </LabeledField>
        </div>

        <LabeledField label="Luogo" icon={MapPin}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Aggiungi luogo o link"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </LabeledField>

        <div>
          <p className="mb-2 text-xs font-medium text-muted">Colore</p>
          <div className="flex gap-2">
            {EVENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Colore ${c}`}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                  color === c ? "ring-2 ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ backgroundColor: c, "--tw-ring-color": c }}
              />
            ))}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note…"
          rows={4}
          className="w-full resize-none rounded-xl border border-line bg-surface-2/40 px-4 py-3
            text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5
            text-sm font-medium text-accent-contrast hover:brightness-110 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isEdit ? "Salva modifiche" : "Crea evento"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-content"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}

function LabeledField({ label, icon: Icon, children }) {
  return (
    <label className="block rounded-xl border border-line bg-surface-2/40 px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs text-muted">
        <Icon size={12} /> {label}
      </span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}
