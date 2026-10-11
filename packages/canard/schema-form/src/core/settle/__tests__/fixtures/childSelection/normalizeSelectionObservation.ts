import { isArray } from '@winglet/common-utils/filter';

/**
 * Preserve runtime scalar distinctions, own-key order and node references in observations.
 * @param value - A runtime result, publication, event payload or error
 * @returns A deterministic JSON-compatible observation; stacks are excluded
 */
export const normalizeSelectionObservation = (value: unknown): unknown => {
  if (value === undefined) return { scalar: 'undefined' };
  if (typeof value === 'number' && !Number.isFinite(value)) return { scalar: String(value) };
  if (Object.is(value, -0)) return { scalar: '-0' };
  if (typeof value === 'function') return { scalar: 'function' };
  if (value === null || typeof value !== 'object') return value;
  if ('blueprintNode' in value && 'runtime' in value && 'path' in value)
    return { node: value.path, kind: (value.blueprintNode as { kind: string }).kind };
  if (value instanceof Error) return { name: value.name, message: value.message,
    fields: Object.keys(value).filter(key => key !== 'stack').map(key =>
      [key, normalizeSelectionObservation(Reflect.get(value, key))]) };
  if (value instanceof Map) return [...value].map(([key, item]) =>
    [normalizeSelectionObservation(key), normalizeSelectionObservation(item)]);
  if (value instanceof Set) return [...value].map(normalizeSelectionObservation);
  if (isArray(value)) return value.map(normalizeSelectionObservation);
  return Object.keys(value).map(key => [key, normalizeSelectionObservation(Reflect.get(value, key))]);
};
