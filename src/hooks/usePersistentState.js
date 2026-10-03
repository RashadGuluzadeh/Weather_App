import { useEffect, useState } from "react";

const resolve = (initial) => (typeof initial === "function" ? initial() : initial);

// localStorage can be unavailable (private mode, blocked storage), so every access is guarded
// and the app falls back to in-memory state.
export function usePersistentState(key, initial, isValid = () => true) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (isValid(parsed)) return parsed;
      }
    } catch {
      // Ignore unreadable or corrupted storage.
    }
    return resolve(initial);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is full or blocked; keep working in memory.
    }
  }, [key, value]);

  return [value, setValue];
}
