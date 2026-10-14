/**
 * Convert a non-member according to the ledger's scalar conversion table.
 * @param {*} value Input that is not already a member of the requested kind.
 * @param {string} kind Target JSON Schema kind; object and array never coerce.
 * @returns {*} Converted scalar, or undefined when conversion is unavailable.
 */
export function convert(value, kind) {
  if (kind === 'string') {
    if (typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value)) return String(value);
    return undefined;
  }
  if (kind === 'boolean') {
    if (value === 'true' || value === 1) return true;
    if (value === 'false' || value === 0) return false;
    return undefined;
  }
  if ((kind !== 'number' && kind !== 'integer') || typeof value !== 'string') return undefined;
  const text = value.trim();
  if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(text)) return undefined;
  const number = Number(text);
  if (!Number.isFinite(number)) return undefined;
  if ((kind === 'integer' || !/[.eE]/.test(text)) && !Number.isSafeInteger(number)) return undefined;
  return number;
}
