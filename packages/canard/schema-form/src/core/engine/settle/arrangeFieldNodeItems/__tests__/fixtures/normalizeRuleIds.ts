/** Position of the blueprint occurrence number inside a serialized rule key. */
const RULE_ID_POSITION = 7;

/**
 * Replace a serialized rule key's occurrence number; any other text is returned unchanged.
 * @param text - Store key or plain string
 * @returns The key with `#` at the occurrence position, or the text itself
 */
const normalizeRuleKey = (text: string): string => {
  if (!text.startsWith('["') || !text.endsWith(']')) return text;
  const parts: unknown = JSON.parse(text);
  if (!Array.isArray(parts) || typeof parts[RULE_ID_POSITION] !== 'number')
    return text;
  parts[RULE_ID_POSITION] = '#';
  return JSON.stringify(parts);
};

/**
 * Replace the per-tree blueprint occurrence number in serialized rule keys, so two trees compiled one after the other compare equal.
 * Sets and maps become arrays in insertion order; every other value keeps its shape.
 * @param value - Observation built from plain data, arrays, sets and maps
 * @returns The same observation with each rule key's occurrence number replaced by `#`
 */
export const normalizeRuleIds = (value: unknown): unknown => {
  if (typeof value === 'string') return normalizeRuleKey(value);
  if (Array.isArray(value)) return value.map(normalizeRuleIds);
  if (value instanceof Set || value instanceof Map)
    return [...value].map(normalizeRuleIds);
  if (value === null || typeof value !== 'object') return value;
  if (Object.getPrototypeOf(value) !== Object.prototype) return value;
  const copy: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value))
    copy[normalizeRuleKey(key)] = normalizeRuleIds(entry);
  return copy;
};
