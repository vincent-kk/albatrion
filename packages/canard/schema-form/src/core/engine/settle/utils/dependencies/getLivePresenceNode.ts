import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';

/**
 * Resolve a bound presence owner through literal, escaped child names.
 * @param root - Live root of the current settlement shape
 * @param path - Absolute bound pointer; navigation operators are field names here
 * @returns The live exact record, or undefined when its current path is absent
 */
export const getLivePresenceNode = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
): Self | undefined => {
  let live: Self | undefined = root;
  for (const segment of path ? path.slice(1).split('/') : []) {
    const name = unescapeSegment(segment);
    live =
      live?.structure && hasOwnProperty(live.structure, name)
        ? live.structure[name]
        : undefined;
    if (!live) break;
  }
  return live && !live.detached ? live : undefined;
};
