import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { distributeLiteralStarValue } from '../literalStar/distributeLiteralStarValue';
import { writeSlotPath } from './writeSlotPath';

/**
 * Interpret an absent input into slots or the literal-star publication exception.
 * @param context - Active write whose root owns the source graph
 * @param path - Absolute inactive address
 * @param template - Kind selected by the first-declaration rule
 * @param value - Caller input interpreted at this candidate
 * @param order - Document position used only by literal-star compatibility
 * @param whole - Whether omitted descendants are replaced
 * @param siblings - Sibling declarations used only by literal-star compatibility
 * @param automatic - Whether the input belongs to a reversible automatic write
 * @returns Whether an interpreted terminal descendant can be emitted
 */
export const writeInactiveSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
  value: unknown,
  order: readonly number[],
  whole: boolean,
  siblings: readonly BlueprintChildEntry[],
  automatic = false,
): boolean =>
  context.root.blueprintNode.containsLiteralStar === true
    ? distributeLiteralStarValue(
        context.root.runtime,
        context,
        path,
        template,
        value,
        order,
        whole,
        siblings,
        automatic,
      )
    : writeSlotPath(
        context.root,
        path,
        template,
        value,
        whole,
        context,
        undefined,
        automatic,
      );
