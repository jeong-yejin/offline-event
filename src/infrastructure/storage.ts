/** Browser persistence boundary. Existing callers own their payload schema. */
export function readStored<T>(key: string): T | null {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : null;
  } catch {
    return null;
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full; the in-memory session remains usable.
  }
}
