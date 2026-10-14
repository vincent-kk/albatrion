import type { SchemaTypeName } from '../../../blueprint';
import { parseNumber } from './utils/number/parseNumber';

/** Convert only the permitted scalar representations and preserve failures. */
export const convert = (
  value: unknown,
  kind: Exclude<SchemaTypeName, 'null'>,
): unknown => {
  switch (kind) {
    case 'number':
    case 'integer': {
      if (typeof value !== 'string') return value;
      const parsed = parseNumber(value);
      return parsed !== undefined &&
        (kind === 'number' || Number.isSafeInteger(parsed))
        ? parsed
        : value;
    }
    case 'string':
      return (typeof value === 'number' && Number.isFinite(value)) ||
        typeof value === 'boolean'
        ? String(value)
        : value;
    case 'boolean':
      if (value === 'true' || value === 1) return true;
      if (value === 'false' || value === 0) return false;
      return value;
    default:
      return value;
  }
};
