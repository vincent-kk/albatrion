/**
 * Test JSON Schema kind membership without coercing an already typed value.
 * @param {*} value Candidate whose current representation is preserved.
 * @param {string} kind A JSON Schema non-null type, or null for direct probes.
 * @returns {boolean} Whether the value belongs to that kind.
 */
export function isMember(value, kind) {
  switch (kind) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'integer': return Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array': return Array.isArray(value);
    case 'null': return value === null;
    default: return false;
  }
}
