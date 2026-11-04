import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { writeSlotPath } from './writeSlotPath';

/**
 * Interpret an absent input into host-owned slots.
 * @param context - Active write whose root owns the source graph
 * @param path - Absolute inactive address
 * @param template - Kind selected by the first-declaration rule
 * @param value - Caller input interpreted at this candidate
 * @param _order - Retained caller ordering metadata
 * @param whole - Whether omitted descendants are replaced
 * @param _siblings - Retained caller declaration context
 * @param automatic - Whether the input belongs to a reversible automatic write
 * @returns Whether an interpreted terminal descendant can be emitted
 */
export const writeInactiveSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
  value: unknown,
  _order: readonly number[],
  whole: boolean,
  _siblings: readonly BlueprintChildEntry[],
  automatic = false,
): boolean =>
  writeSlotPath(context.root, path, template, value, whole, context, automatic);
