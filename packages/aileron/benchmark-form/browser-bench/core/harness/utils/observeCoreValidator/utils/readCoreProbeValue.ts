/**
 * Read the string at a JSON Pointer inside a validator's root data.
 * @param data - Root emit handed to the validator; any shape is tolerated.
 * @param path - JSON Pointer such as `/items/0/name`; null reads nothing.
 * @returns The string at the path, or null when absent or not a string.
 */
export function readCoreProbeValue(
  data: unknown,
  path: string | null,
): string | null {
  if (path === null) return null;
  let current: unknown = data;
  for (const segment of path.split('/').slice(1)) {
    if (typeof current !== 'object' || current === null) return null;
    current = Array.isArray(current)
      ? current[Number(segment)]
      : Reflect.get(current, segment);
  }
  return typeof current === 'string' ? current : null;
}
