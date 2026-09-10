/** Construct a fresh record in key order without copying an expanding accumulator. */
export function mapRecord<K extends string, V>(ids: readonly K[], transform: (id: K) => V): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const id of ids) {
    const value = transform(id);
    if (id === '__proto__') {
      Object.defineProperty(result, id, { value, enumerable: true, writable: true, configurable: true });
    } else {
      result[id] = value;
    }
  }
  return result;
}
