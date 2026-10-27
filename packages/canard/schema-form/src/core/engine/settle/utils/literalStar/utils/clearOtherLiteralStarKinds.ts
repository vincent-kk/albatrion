import { unescapeSegment } from '@winglet/json/pointer';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry, BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../../record';
import { getBlueprintNodeIdentity } from '../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../../types/settlement';
import { setLiteralStarRaw } from '../../literalStarStore/setLiteralStarRaw';

/**
 * Remove other kinds at the one address owned by an ordinary latent write.
 * @param runtime - Tree-local latent storage
 * @param context - Optional rollback and latent-index bookkeeping
 * @param path - Supplied occurrence's absolute address
 * @param template - Kind receiving this write
 * @param siblings - All declarations at the parent address
 * @returns Nothing; descendants and same-kind sources are not cleared here
 */
export const clearOtherLiteralStarKinds = <Self extends FieldNodeRecord<Self>>(
  runtime: FieldNodeRuntime<Self>,
  context: SettlementContext<Self> | undefined,
  path: string,
  template: BlueprintNode,
  siblings: readonly BlueprintChildEntry[],
): void => {
  const name = unescapeSegment(path.slice(path.lastIndexOf($.Separator) + 1));
  for (const entry of siblings)
    if (
      entry.name === name &&
      getBlueprintNodeIdentity(entry.node) !==
        getBlueprintNodeIdentity(template)
    )
      setLiteralStarRaw(
        runtime,
        context?.inTransition ? context.literalStarAutomaticLog : undefined,
        JSON.stringify([path, getBlueprintNodeIdentity(entry.node)]),
        false,
        undefined,
        undefined,
        undefined,
        context,
      );
};
