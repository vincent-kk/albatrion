
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { resolveSlotSource } from './resolveSlotSource';
import { writeSlotPath } from './writeSlotPath';

/**
 * Distribute structural input to missing kinds without clearing retained siblings.
 * @param context - Candidate-bearing replay and its latent rollback bookkeeping
 * @param path - Absolute destination of an inactive declared occurrence
 * @param template - Kind that would interpret input if its gate were active
 * @param composed - Ordinary input carried by the surviving slot
 * @param _order - Retained caller ordering metadata
 * @returns Nothing; exact existing sources and their metadata remain untouched
 */
export const distributeMovedSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  template: BlueprintNode,
  composed: unknown,
  _order: readonly number[],
): void => {
  const retained = resolveSlotSource(context.root, path, template);
  if (retained.source || retained.overlay) return;
  writeSlotPath(
    context.root,
    path,
    template,
    composed,
    false,
    context,
    undefined,
    false,
    true,
  );
};
