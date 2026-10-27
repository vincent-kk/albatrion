import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { isPlain } from '../input/isPlain';
import { LiteralStarHostSource } from '../literalStarStore/LiteralStarHostSource';
import { getEnteredLiteralStarKeys } from '../literalStarStore/getEnteredLiteralStarKeys';
import { getLiteralStarPathIndex } from '../literalStarStore/getLiteralStarPathIndex';
import { isSlotEligible } from './isSlotEligible';
import { readSlotRawTree } from './readSlotRawTree';
import { resolveSlotSource } from './resolveSlotSource';

/**
 * Recompose a gated-out item from its retained own-kind latent sources.
 * @param context - Settlement retaining sources by actual occurrence path and kind
 * @param path - Runtime position of the absent item or descendant
 * @param template - Blueprint kind and declared children at that position
 * @returns Its retained source value, or undefined when no source exists
 */
export const readInactiveSlotSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
): unknown => {
  const runtime = context.root.runtime;
  if (isSlotEligible(runtime)) {
    const resolved = resolveSlotSource(context.root, path, template);
    return resolved.source || resolved.overlay
      ? readSlotRawTree(template, resolved.source, resolved.overlay)
      : undefined;
  }

  const own = runtime.literalStarRaw?.get(
    JSON.stringify([path, getBlueprintNodeIdentity(template)]),
  );
  if (own !== undefined && !(own instanceof LiteralStarHostSource)) return own;
  if (own instanceof LiteralStarHostSource && own.raw !== undefined)
    return own.raw;
  if (template.kind !== 'object' || template.strategy !== 'branch')
    return undefined;
  if (own === undefined) {
    const entered = getEnteredLiteralStarKeys(context);
    let hasDescendant = false;
    for (const key of getLiteralStarPathIndex(context).get(path) ?? []) {
      if (JSON.parse(key)[0] === path) continue;
      if (
        entered
          .get(key)
          ?.some(
            (node) =>
              !node.detached &&
              (!node.parent || node.parent.structure?.[node.name] === node),
          )
      )
        continue;
      hasDescendant = true;
      break;
    }
    if (!hasDescendant) return undefined;
  }
  const value: Record<string, unknown> =
    own instanceof LiteralStarHostSource && isPlain(own.undeclaredValues)
      ? { ...own.undeclaredValues }
      : {};
  let found = Object.keys(value).length > 0;
  for (const entry of template.childEntries) {
    if (hasOwnProperty(value, entry.name)) continue;
    const child = readInactiveSlotSource(
      context,
      path + '/' + escapeSegment(entry.name),
      entry.node,
    );
    if (child === undefined) continue;
    Object.defineProperty(value, entry.name, {
      value: child,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    found = true;
  }
  return found ? value : undefined;
};
