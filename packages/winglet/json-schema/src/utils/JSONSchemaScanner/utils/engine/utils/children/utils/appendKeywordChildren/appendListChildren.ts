import { isObject } from '@winglet/common-utils/filter';

import type { SchemaEntry } from '../../../../../../type';

/**
 * Capture object elements of an items tuple or composition list in index order.
 * @param entries Stack receiving fresh child entries.
 * @param nodes Validated applicator array, whose holes and non-objects are skipped.
 * @param keyword Matched applicator name.
 * @param parentPath Parent schema path captured before reading applicator values.
 * @param parentDataPath Parent data path captured before reading applicator values.
 * @param depth Captured child depth.
 * @param contributesDataPath Whether the index also addresses user data.
 * @returns Nothing; array elements retain their original numeric variants.
 */
export function appendListChildren<Entry extends SchemaEntry>(
  entries: Entry[],
  nodes: unknown[],
  keyword: string,
  parentPath: string,
  parentDataPath: string,
  depth: number,
  contributesDataPath: boolean,
): void {
  const path = parentPath + '/' + keyword + '/';
  const dataPath = contributesDataPath ? parentDataPath + '/' : parentDataPath;
  for (let i = 0, length = nodes.length; i < length; i++) {
    const child = nodes[i];
    if (!isObject(child)) continue;
    entries.push({
      schema: child,
      path: path + i,
      keyword,
      variant: i,
      dataPath: contributesDataPath ? dataPath + i : dataPath,
      depth,
    } as Entry);
  }
}
