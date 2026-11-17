import { isValidElement } from 'react';

import { isArray } from '@winglet/common-utils/filter';

/**
 * Read one authored property without allowing a throwing getter to abort its siblings.
 * @param value - Object currently being normalized for display.
 * @param key - Enumerable string key selected from that object.
 * @returns The property value or the "[Thrown getter]" display marker.
 */
function readDisplayProperty(value: object, key: string): unknown {
  try { return Reflect.get(value, key); }
  catch { return '[Thrown getter]'; }
}

/**
 * Identify DOM nodes across window realms before inspecting any enumerable properties.
 * @param value - Candidate object; native nodeType/nodeName identify the DOM surface.
 * @returns A tag/id marker, or undefined when the object does not resemble a DOM node.
 */
function getDOMMarker(value: object): string | undefined {
  const node = value as Partial<Node & Element>;
  if (typeof node.nodeType !== 'number' || typeof node.nodeName !== 'string') return undefined;
  return `<${node.nodeName.toLowerCase()}${typeof node.id === 'string' && node.id ? `#${node.id}` : ''}>`;
}

/**
 * Normalize one display value into JSON-compatible data without invoking authored toJSON methods.
 * @param value - Story datum or readout to inspect, including browser-owned objects.
 * @param ancestors - Original objects on this recursion path; reused sibling references remain valid.
 * @returns Plain JSON data and special-value markers; inspection failures become "[Unserializable]".
 */
export function toDisplayValue(value: unknown, ancestors: readonly object[] = []): unknown {
  try {
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}`;
    if (typeof value === 'bigint' || typeof value === 'symbol') return String(value);
    if (value === null || typeof value !== 'object') return value;
    const domMarker = getDOMMarker(value);
    if (domMarker) return domMarker;
    if (isValidElement(value)) {
      const type = value.type;
      const component = type as { displayName?: string; name?: string } | null;
      return `<${typeof type === 'string' ? type : component?.displayName || component?.name || 'Component'}/>`;
    }
    if (ancestors.includes(value)) return '[Circular]';
    const path = [...ancestors, value];
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object File]' || tag === '[object Blob]') {
      const file = value as Blob & { name?: string };
      return `File(${file.name ?? 'blob'}, ${file.size})`;
    }
    if (tag === '[object RegExp]' || tag === '[object Error]') return String(value);
    if (tag === '[object Date]') return Date.prototype.toJSON.call(value);
    if (tag === '[object Map]') return Array.from((value as Map<unknown, unknown>).entries(), ([key, item]) => [toDisplayValue(key, path), toDisplayValue(item, path)]);
    if (tag === '[object Set]') return Array.from((value as Set<unknown>).values(), (item) => toDisplayValue(item, path));
    if (isArray(value)) return Array.from(value, (item) => toDisplayValue(item, path));
    return Object.fromEntries(Object.keys(value).map((key) => [key, toDisplayValue(readDisplayProperty(value, key), path)]));
  } catch { return '[Unserializable]'; }
}
