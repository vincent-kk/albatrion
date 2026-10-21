import type { FieldNodeRecord } from '../../../record';
import type {
  GateSelectionGroup,
  RootGateSelectionGroup,
} from '../../types/gateSelectionTable';
import type { SettlementContext } from '../../types/settlement';
import { readGateBucket } from '../compute/childSelection/gateSelection/readGateBucket';
import { gateSelectionTable } from './gateSelectionTable';
import { getGateExpression } from './getGateExpression';
import { getGateRegistry } from './getGateRegistry';
import { readProjectedValue } from './readProjectedValue';
import { recordGateInput } from './recordGateInput';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Read once at the group's first authored gate site and share the value this round.
 * @param node - Eligible host whose round was prepared before root selection
 * @param context - Current round cache and real witness frame
 * @param group - Root or child group bound to the same baseline terminal name
 * @returns The watched primitive or reference exactly as projected at this site
 */
export const readGateSelectionGroup = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  group: GateSelectionGroup | RootGateSelectionGroup,
): unknown => {
  const round = context.gateSelectionRounds!.get(node)!;
  const cached = round.values.get(group.watchedName);
  if (cached) return cached.value;
  const registry = getGateRegistry(node.runtime);
  const path = registry.locate(node, group.firstGate).watchPaths[0];
  const value = readProjectedValue(context, path);
  recordGateInput(context, path, value, 'value');
  round.values.set(group.watchedName, {
    path,
    value,
    occurrences:
      gateSelectionTable.mode === 'verify'
        ? registry.occurrenceCount(node.path)
        : 0,
  });
  if (gateSelectionTable.mode === 'verify') {
    const childGroup = round.table.groups.find(
      (candidate) => candidate.watchedName === group.watchedName,
    )!;
    const admitted = readGateBucket(childGroup.buckets, value);
    const indices = new Set<number>();
    for (const bucket of childGroup.buckets.values())
      for (const index of bucket) indices.add(index);
    for (const index of indices) {
      const step = round.table.plan.steps[index];
      if (!step.gate || !childGroup.literalsByGate.has(step.gate)) continue;
      const expression = getGateExpression(
        node.runtime.blueprint,
        step.gate.schemaPath,
      )!;
      verifyGateSelection(
        admitted.includes(index) === Boolean(expression.evaluate([value])),
        'S1 table step verdict: ' + index,
      );
    }
  }
  return value;
};
