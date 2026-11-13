import type { SchemaEntry } from '../../../../../type';
import type { OrderedKeywordDescriptor } from '../../../../vocabulary/type';
import { appendListChildren } from './appendKeywordChildren/appendListChildren';
import { appendMapChildren } from './appendKeywordChildren/appendMapChildren';

/**
 * Capture one applicator's union-vocabulary children without visiting malformed array schemas.
 * @param entries Engine stack receiving fresh child entries.
 * @param schema Parent object captured before any applicator getter runs.
 * @param descriptor Precompiled kind, escaped keyword and dialect membership.
 * @param path Captured parent schema path.
 * @param dataPath Captured parent data path.
 * @param depth Captured child depth.
 * @param dialect Current resource dialect bit.
 * @param inheritedInert Whether an ancestor is already outside schema positions.
 * @param visitBooleans Whether callbacks can observe boolean leaves.
 * @returns Nothing; unsupported positions are visited as inert, malformed values are skipped.
 */
export function appendKeywordChildren<Entry extends SchemaEntry>(
  entries: Entry[],
  schema: Record<string, unknown>,
  descriptor: OrderedKeywordDescriptor,
  path: string,
  dataPath: string,
  depth: number,
  dialect: number,
  inheritedInert: boolean,
  visitBooleans: boolean,
  legacyMode: 0 | 1 | 2,
): void {
  const { keyword, kind } = descriptor;
  const node = schema[keyword];
  const keep =
    legacyMode > 0 && (keyword === 'definitions' || keyword === '$defs');
  const inert =
    inheritedInert ||
    (!keep && ((descriptor.mask & dialect) === 0 || legacyMode === 1));
  switch (kind) {
    case 'schemaMap':
    case 'objectMap':
      appendMapChildren(
        entries,
        node,
        descriptor,
        path,
        dataPath,
        depth,
        kind === 'objectMap',
        inert,
        dialect === 1,
        visitBooleans,
      );
      break;
    case 'schemaList':
      if (Array.isArray(node))
        appendListChildren(
          entries,
          node,
          descriptor,
          path,
          dataPath,
          depth,
          false,
          inert,
          dialect === 1,
          visitBooleans,
        );
      break;
    case 'items':
    case 'schema':
      if (kind === 'items' && Array.isArray(node))
        appendListChildren(
          entries,
          node,
          descriptor,
          path,
          dataPath,
          depth,
          true,
          inert || (keyword === 'items' && dialect === 16),
          dialect === 1,
          visitBooleans,
        );
      else if (
        (node !== null && typeof node === 'object' && !Array.isArray(node)) ||
        (visitBooleans && typeof node === 'boolean')
      ) {
        const child = {
          schema: node,
          path: path + '/' + descriptor.path,
          keyword,
          dataPath,
          depth,
        } as Entry;
        if (
          inert ||
          (kind === 'items' && keyword === 'prefixItems') ||
          (dialect === 1 && typeof node === 'boolean')
        )
          child.inert = true;
        entries.push(child);
      }
      break;
  }
}
