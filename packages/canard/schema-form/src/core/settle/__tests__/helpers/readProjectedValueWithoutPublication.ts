import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Independently read a projected path without publication or registry effects.
 * @param context - Actual original-site state, never mutated by this reader
 * @param path - Absolute bound read whose consumed or published nodes must be ready
 * @returns The full evaluator's value when the design's publication assertion holds
 * @throws Error when a consumed or baseline-published node has a pending output
 */
export const readProjectedValueWithoutPublication = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
): unknown => {
  let node = context.root;
  const emission = (record: Self): unknown => record.emit === undefined ||
    (context.changedRaw.has(record.path) && !context.changedNodes.has(record))
    ? undefined : record.emit;
  const assertPublished = (record: Self): void => {
    if (context.pendingOutputs?.has(record))
      throw new Error(`Pending output consumed or published on shadow read ${path}: ${record.path || '<root>'}`);
  };
  if (!path) assertPublished(node);
  let value = emission(node);
  if (!path) return value;
  let atNode = true;
  const encoded = path.slice(1).split('/');
  for (let index = 0; index < encoded.length; index++) {
    const name = encoded[index].replace(/~1/g, '/').replace(/~0/g, '~');
    if (node.behavior.strategy === 'branch' && node.raw !== undefined)
      assertPublished(node);
    if (node.behavior.strategy === 'branch' && node.raw !== undefined &&
      (node.parent !== null || value === null || typeof value !== 'object' ||
        !hasOwnProperty(value, name))) return undefined;
    const child = node.structure && hasOwnProperty(node.structure, name)
      ? node.structure[name] : undefined;
    if (child) {
      node = child;
      atNode = true;
      value = emission(node);
      continue;
    }
    assertPublished(node);
    atNode = false;
    if (value !== null && typeof value === 'object' && hasOwnProperty(value, name))
      value = Reflect.get(value, name);
    else {
      const entries = node.blueprintNode.childEntries;
      let declared = false;
      for (let entry = 0; entry < entries.length; entry++)
        if (entries[entry].name === name) { declared = true; break; }
      if (!declared && node.extras !== null && typeof node.extras === 'object' &&
        hasOwnProperty(node.extras, name)) value = Reflect.get(node.extras, name);
      else return undefined;
    }
  }
  if (atNode) assertPublished(node);
  return value;
};
