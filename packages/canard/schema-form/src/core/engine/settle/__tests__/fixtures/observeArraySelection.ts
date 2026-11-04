import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { observeArraySettlement } from './observeArraySettlement';

/**
 * Observe settlement without the per-tree rule stores (keys and values).
 * @param root - Committed tree whose public values and delivery ledgers are compared
 * @returns Existing settlement observations without the rule stores, whose keys embed per-tree identities; their effects remain compared through values and outputs
 */
export const observeArraySelection = (root: PlainNode): unknown => {
  const observation = observeArraySettlement(root);
  if (observation === null || typeof observation !== 'object')
    throw new Error('Expected settlement observation');
  for (const field of ['rules', 'ruleSources', 'ruleTargets'])
    Reflect.deleteProperty(observation, field);
  return observation;
};
