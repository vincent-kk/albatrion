import { escapeSegment } from '@winglet/json/pointer';

import type { SchemaEntry } from '../../../type';

/**
 * Build source provenance for hand-written resolver fixtures, without exposing visitor entries to production providers.
 * @param parent Fixture-owned original parent context.
 * @param keyword Lexical applicator name supplied by the protocol.
 * @param schema Original child schema.
 * @returns A fresh fixture context using source identity only to recover its variant.
 */
export function contextForChild(
  parent: SchemaEntry,
  keyword: string,
  schema: SchemaEntry['schema'],
): SchemaEntry {
  const container =
    typeof parent.schema === 'object' ? parent.schema[keyword] : undefined;
  const variant = Array.isArray(container)
    ? container.indexOf(schema)
    : container && typeof container === 'object' && container !== schema
      ? Object.keys(container).find((key) => container[key] === schema)
      : undefined;
  const suffix =
    variant === undefined ? '' : '/' + escapeSegment(String(variant));
  return {
    schema,
    path: parent.path + '/' + escapeSegment(keyword) + suffix,
    keyword,
    variant,
    dataPath:
      parent.dataPath +
      (keyword === 'properties' ||
      ((keyword === 'items' || keyword === 'prefixItems') &&
        typeof variant === 'number')
        ? suffix
        : ''),
    depth: parent.depth + 1,
  };
}
