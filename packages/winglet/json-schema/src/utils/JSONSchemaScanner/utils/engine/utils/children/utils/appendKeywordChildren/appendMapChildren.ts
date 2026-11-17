import { escapeSegment } from '@winglet/json/pointer';

import type { OrderedKeywordDescriptor } from '../../../../../keywordMap/type';
import type { SchemaEntry } from '../../../../../type';

/**
 * Capture own map values while preserving key order and escaped schema/data paths.
 * @param entries Stack receiving separate entries for each accepted object or boolean value.
 * @param node Untrusted map; arrays, null and primitives contribute no entries.
 * @param descriptor Compiled keyword and escaped path token.
 * @param parentPath Captured parent schema path.
 * @param parentDataPath Captured parent data path.
 * @param depth Captured child depth.
 * @param contributesDataPath Whether map keys address user data as well as schema positions.
 * @param inert Inherited or keyword-level inertness.
 * @param booleanInert Whether the dialect predates boolean schemas.
 * @param visitBooleans Whether callbacks can observe boolean leaves.
 * @returns Nothing; repeated source objects remain separate captured occurrences.
 */
export function appendMapChildren<Entry extends SchemaEntry>(
  entries: Entry[],
  node: unknown,
  descriptor: OrderedKeywordDescriptor,
  parentPath: string,
  parentDataPath: string,
  depth: number,
  contributesDataPath: boolean,
  inert: boolean,
  booleanInert: boolean,
  visitBooleans: boolean,
): void {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  const map = node as Record<string, unknown>;
  const keys = Object.keys(map);
  const path = parentPath + '/' + descriptor.path + '/';
  const dataPath = contributesDataPath ? parentDataPath + '/' : parentDataPath;
  const keyword = descriptor.keyword;
  for (let i = 0, length = keys.length; i < length; i++) {
    const key = keys[i];
    const schema = map[key];
    if (
      !(
        (schema !== null &&
          typeof schema === 'object' &&
          !Array.isArray(schema)) ||
        (visitBooleans && typeof schema === 'boolean')
      )
    )
      continue;
    const escaped = escapeSegment(key);
    const child = {
      schema,
      path: path + escaped,
      keyword,
      variant: key,
      dataPath: contributesDataPath ? dataPath + escaped : dataPath,
      depth,
    } as Entry;
    if (inert || (booleanInert && typeof schema === 'boolean'))
      child.inert = true;
    entries.push(child);
  }
}
