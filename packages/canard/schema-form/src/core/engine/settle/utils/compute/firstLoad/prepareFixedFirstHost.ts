import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { staticIds } from '../childSelection/staticIds';
import { resetWheelStartSchema } from '../resetWheelStartSchema';

/**
 * Retain one ordinary priming baseline and start later wheels from it for the schemas gates can change.
 * A child whose schema differs from its baseline is reset to it like an ungated start
 * (`resetWheelStartSchema`): it computes under the baseline, and a restored schema is no change.
 * @param node - Object host at its original wheel priming boundary
 * @param context - Invocation-owned mount preparation and ordinary dirty bookkeeping
 * @param constructed - True after ordinary prime has built every unconditional child
 * @returns The children reset to their baseline when an existing baseline replaced this
 * priming pass; undefined when the ordinary priming pass runs
 */
export const prepareFixedFirstHost = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  constructed = false,
): Optional<readonly Self[]> => {
  const preparation = context.fixedFirstLoad;
  if (!preparation) return undefined;
  const plan = preparation.plan.hosts[node.blueprintNode.id];
  if (!plan) return undefined;
  const baseline = preparation.hosts.get(node);
  if (!baseline) {
    if (!constructed) return undefined;
    const affected = [];
    for (const entry of plan.entries) {
      const child = node.__childrenByName__![entry.name];
      if (
        entry.declarations.some((declaration) => declaration.gates.length > 0)
      )
        affected.push({ child, schema: child.__schema__ });
      else
        context.selectedDeclarationIds.set(
          child,
          staticIds(entry, node.blueprintNode),
        );
    }
    preparation.hosts.set(node, affected);
    return undefined;
  }
  const reset: Self[] = [];
  for (const { child, schema } of baseline) {
    if (child.__schema__ === schema) continue;
    resetWheelStartSchema(node, child, schema, context);
    reset.push(child);
  }
  return reset;
};
