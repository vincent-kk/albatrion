import { isArray } from '@winglet/common-utils/filter';
import { DEFAULT_KEYWORDS } from '@winglet/json-schema/scanner';

import { STRIP_SCHEMA_KEYWORDS } from '../constant';

/**
 * Isolate schema child containers before the scanner reassembles replacements.
 * @param schema - One schema location, whose literal values must retain identity.
 * @returns A shallow schema copy with independently writable schema containers.
 */
export const copySchemaContainers = (
  schema: Readonly<Record<string, unknown>>,
): Record<string, unknown> => {
  const result = { ...schema };
  for (const { keyword, kind } of [
    ...DEFAULT_KEYWORDS,
    ...STRIP_SCHEMA_KEYWORDS,
  ]) {
    const value = result[keyword];
    if (!value || typeof value !== 'object') continue;
    if (kind === 'schemaMap' || kind === 'objectMap')
      result[keyword] = { ...value };
    else if (
      (kind === 'schemaList' || kind === 'items') &&
      isArray(value)
    )
      result[keyword] = [...value];
  }
  return result;
};
