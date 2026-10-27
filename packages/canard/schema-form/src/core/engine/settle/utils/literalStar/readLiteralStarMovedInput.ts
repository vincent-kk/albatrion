import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { isPlain } from '../input/isPlain';
import { LiteralStarHostSource } from '../literalStarStore/LiteralStarHostSource';
import { readInactiveSlotSource } from '../slots/readInactiveSlotSource';

/**
 * Select public replay input without confusing a kind token with host storage.
 * @param context - Structural settlement retaining the moved slot's sources
 * @param path - Destination occurrence whose exact kind source may exist
 * @param template - Destination declaration used when its source is absent
 * @param composed - Ordinary composed input carried by the surviving slot
 * @returns The own-kind public source, complemented by composed declared children,
 * or the ordinary input when that exact source is absent
 */
export const readLiteralStarMovedInput = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
  composed: unknown,
): unknown => {
  const runtime = context.root.runtime;
  const key = JSON.stringify([path, getBlueprintNodeIdentity(template)]);
  if (!runtime.literalStarRaw?.has(key)) return composed;
  const own = runtime.literalStarRaw?.get(key);
  if (!(own instanceof LiteralStarHostSource)) return own;
  if (own.raw !== undefined) return own.raw;
  const source =
    isPlain(composed) && !(composed instanceof LiteralStarHostSource)
      ? composed
      : readInactiveSlotSource(
          context,
          path,
          runtime.literalStarRawMetadata?.get(key)?.blueprintNode ?? template,
        );
  return {
    ...(isPlain(source) ? source : undefined),
    ...(isPlain(own.undeclaredValues) ? own.undeclaredValues : undefined),
  };
};
