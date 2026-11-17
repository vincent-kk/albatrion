import { toDisplayValue } from './utils/toDisplayValue';

/**
 * Display story data without walking DOM properties or React element internals; never throw.
 * @param value - Data to normalize: cycles become "[Circular]", functions "ƒ name",
 * React elements "<DisplayName/>", DOM nodes "<tag#id>" (omitting absent ids), and
 * undefined "undefined". Maps become entry arrays and Sets value arrays. Files and
 * Blobs become "File(name, size)" (unnamed Blobs use "blob"); RegExp, Error, bigint
 * and symbols use their string forms. Dates retain their JSON representation.
 * @param space - Standard JSON indentation, defaulting to two spaces.
 * @returns JSON text. Throwing property reads become "[Thrown getter]"; other
 * inspection or serialization failures become "[Unserializable]".
 */
export function toDisplayJSON(value: unknown, space = 2): string {
  try { return JSON.stringify(toDisplayValue(value), null, space) ?? '"undefined"'; }
  catch { return '"[Unserializable]"'; }
}
