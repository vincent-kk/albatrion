import { isObject } from '@winglet/common-utils/filter';
import { escapeSegment } from '@winglet/json/pointer';

import type { SchemaEntry } from '../../../../../../type';

/**
 * Capture own map values, preserving JavaScript key order and RFC 6901 escaping.
 * @param entries Stack receiving valid object-valued children.
 * @param node Untrusted applicator container; non-objects contribute no entries.
 * @param keyword Applicator name already selected by the vocabulary.
 * @param parentPath Parent schema path captured before reading applicator values.
 * @param parentDataPath Parent data path captured before reading applicator values.
 * @param depth Captured child depth.
 * @param contributesDataPath Whether map keys also address user data.
 * @returns Nothing; each child gets its own entry while schema objects stay shared.
 */
export function appendMapChildren<Entry extends SchemaEntry>(
  entries: Entry[],
  node: unknown,
  keyword: string,
  parentPath: string,
  parentDataPath: string,
  depth: number,
  contributesDataPath: boolean,
): void {
  if (!isObject(node)) return;
  const map = node as Record<string, unknown>;
  const keys = Object.keys(map);
  const path = parentPath + '/' + keyword + '/';
  const dataPath = contributesDataPath ? parentDataPath + '/' : parentDataPath;
  for (let i = 0, length = keys.length; i < length; i++) {
    const key = keys[i];
    const child = map[key];
    if (!isObject(child)) continue;
    const escaped = escapeSegment(key);
    entries.push({
      schema: child,
      path: path + escaped,
      keyword,
      variant: key,
      dataPath: contributesDataPath ? dataPath + escaped : dataPath,
      depth,
    } as Entry);
  }
}
