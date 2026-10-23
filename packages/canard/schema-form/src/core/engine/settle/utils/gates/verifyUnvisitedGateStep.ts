import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { DirectChildSelection } from '../compute/childSelection/getDirectChildSelectionPlan';
import type { ChildSelectionFrame } from '../compute/childSelection/selectEntryStep';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Prove all four no-effect conditions independently of the visit collector and its index.
 * @param frame - Shared selection state at the skipped step's original position
 * @param step - Rejected table step that the production path would omit
 * @returns Nothing; throws S2′ if any original inactive-step effect could occur
 */
export const verifyUnvisitedGateStep = <Self extends FieldNodeRecord<Self>>(
  frame: ChildSelectionFrame<Self>,
  step: DirectChildSelection,
): void => {
  const { node, context, prior, next } = frame;
  const { entry } = step;
  const path = node.path + '/' + escapeSegment(entry.name);
  verifyGateSelection(
    !hasOwnProperty(prior, entry.name) ||
      prior[entry.name].blueprintNode !== entry.node,
    'S2′ prior child: ' + path,
  );
  verifyGateSelection(
    !hasOwnProperty(next, entry.name),
    'S2′ current structure: ' + path,
  );
  verifyGateSelection(
    !context.pendingExits.has(
      JSON.stringify([path, getBlueprintNodeIdentity(entry.node)]),
    ),
    'S2′ pending exit: ' + path,
  );
  const distribution = context.distributedInputs.get(node);
  verifyGateSelection(
    !distribution ||
      !hasDistributedChildInput(distribution.input, entry.name, false),
    'S2′ distributed input: ' + path,
  );
};
