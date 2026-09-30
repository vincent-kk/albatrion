import type { SchemaNodeRecord } from '../../../../../record';
import { resolveDependencyPath } from '../../../../utils/paths/resolveDependencyPath';
import type { DeriveRoundDecision, DeriveRule, DeriveWrite } from '../../../type';
import { KIND_RANK, LAYER_RANK } from '../../rank/compareDeriveWrites';
import { getDeriveSourceOrder } from '../../rank/getDeriveSourceOrder';
import { getInjectEntries } from './getInjectEntries';
import { getInjectTarget } from './getInjectTarget';
import { getInjectToContext } from './getInjectToContext';
import { getVirtualWriteFailure } from './getVirtualWriteFailure';

/**
 * Evaluate one fired handler without writing raw or latent state.
 * @param source - Live rule source
 * @param root - Calculated root for this round
 * @param rule - Authored function and declaration order
 * @returns Candidates or one failure that excludes the entire rule
 */
export const evaluateInjectTo = <Self extends SchemaNodeRecord<Self>>(
  source: Self, root: Self, rule: DeriveRule,
): { writes: readonly DeriveWrite<Self>[];
  failure?: DeriveRoundDecision<Self>['failure'] } => {
  if (typeof rule.literal !== 'function') return { writes: [] };
  let result: unknown;
  try {
    result = rule.literal(source.emit, getInjectToContext(source, root));
  } catch (cause) {
    return { writes: [], failure: { sourcePath: source.path,
      schemaPath: rule.schemaPath, cause, kind: 'expression' } };
  }
  const writes: DeriveWrite<Self>[] = [];
  const entries = getInjectEntries(result);
  for (let index = 0; index < entries.length; index++) {
    const [relative, value] = entries[index];
    if (value === undefined) continue;
    const targetPath = resolveDependencyPath(source.path, relative);
    const resolved = getInjectTarget(root, targetPath);
    if (!resolved) return { writes: [], failure: { sourcePath: source.path,
      schemaPath: rule.schemaPath, cause: relative, kind: 'injectTarget', targetPath } };
    const invalid = getVirtualWriteFailure(source.path, rule.schemaPath,
      targetPath, resolved.template, value);
    if (invalid) return { writes: [], failure: invalid };
    writes.push({ target: resolved.target, targetPath,
      template: resolved.template, siblings: resolved.siblings,
      targetOrder: resolved.order, value, kind: 'injectTo', rank: KIND_RANK.injectTo,
      layer: LAYER_RANK[rule.layer], sourceOrder: getDeriveSourceOrder(source),
      ruleOrder: rule.order, returnOrder: index });
  }
  return { writes };
};
