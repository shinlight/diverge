import { useCallback, useEffect, useState } from "react";
import { loadNotes, saveNotes, uid } from "./notesService";

export function useNotes() {
  const [notes, setNotes] = useState(loadNotes);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const addNote = useCallback((text, color) => {
    const value = text.trim();
    if (!value) return;
    setNotes((list) => [
      { id: uid(), text: value, color, updatedAt: Date.now() },
      ...list,
    ]);
  }, []);

  const updateNote = useCallback((id, text) => {
    const value = text.trim();
    setNotes((list) =>
      list.map((n) => (n.id === id ? { ...n, text: value, updatedAt: Date.now() } : n))
    );
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes((list) => list.filter((n) => n.id !== id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
}
