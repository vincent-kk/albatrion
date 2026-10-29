import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type {
  GateSelectionGroup,
  RootGateSelectionGroup,
} from '../../types/gateSelectionTable';
import type { SettlementContext } from '../../types/settlement';
import { readGateBucket } from '../compute/childSelection/gateSelection/readGateBucket';
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
      engineModes.gateSelection === 'verify'
        ? registry.occurrenceCount(node.path)
        : 0,
  });

  if (engineModes.gateSelection === 'verify') {
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
      const expression =
        step.gate.kind === 'discriminator'
          ? undefined
          : getGateExpression(node.runtime.blueprint, step.gate.schemaPath);
      let selectedResult: boolean;
      if (step.gate.kind === 'discriminator') {
        let matchesDiscriminatorTag = false;

        const discriminatorValues = step.gate.condition.values;
        for (
          let index = 0, count = discriminatorValues.length;
          index < count;
          index++
        ) {
          const tag = discriminatorValues[index];

          if (tag === value) {
            matchesDiscriminatorTag = true;
            break;
          }
        }

        selectedResult = matchesDiscriminatorTag;
      } else {
        selectedResult = Boolean(expression!.evaluate([value]));
      }
      verifyGateSelection(
        (admitted.indexOf(index) !== -1) === selectedResult,
        'S1 table step verdict: ' + index,
      );
    }
  }
  return value;
};
