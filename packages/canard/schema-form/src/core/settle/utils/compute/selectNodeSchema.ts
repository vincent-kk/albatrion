import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { MULTIPLE_GATED_BRANCHES_ACTIVE, SchemaFormError } from '../../../../errors';
import { mergeEffectiveSchema } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import { indexSchemaNodeWarning } from '../../../record';
import type { SettlementContext } from '../../type';
import { evaluateGate } from '../gates/evaluateGate';
import { SHARED_NODE_CONFLICT } from '../errors/settleErrorCode';

/**
 * Recompute one node's active overlays and effective schema in a host round.
 * @param node - Current occurrence whose declarations may have changed gates
 * @param context - Projection and deferred failure for this settlement
 * @returns Whether the effective schema reference changed
 */
export const selectNodeSchema = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const active = node.blueprintNode.declarations.filter((declaration) =>
    declaration.gates.every((gate) => evaluateGate(gate, context, node)));
  if (node.runtime.errorReporter?.hasConsumer()) {
    const branches = new Map<string, number[]>();
    for (const declaration of active) {
      const match = /^(.*\/oneOf)\/(\d+)(?:\/|$)/.exec(declaration.schemaPath);
      if (!match || !declaration.gates.some((gate) =>
        gate.schemaPath.startsWith(`${match[1]}/${match[2]}/`))) continue;
      const branch = Number(match[2]);
      const selected = branches.get(match[1]) ?? [];
      if (!selected.includes(branch)) selected.push(branch);
      branches.set(match[1], selected);
    }
    for (const [schemaPath, selected] of branches) {
      if (selected.length < 2) continue;
      const code = `SCHEMA_FORM_WARNING.${MULTIPLE_GATED_BRANCHES_ACTIVE}` as const;
      const key = JSON.stringify([code, node.path, schemaPath]);
      if (node.runtime.warningKeys?.has(key)) continue;
      (node.runtime.warningKeys ??= new Set()).add(key);
      const record = {
        level: 'warning', code, path: node.path, schemaPath,
        message: `Multiple gated oneOf branches are active at ${schemaPath}`,
        details: { branches: selected },
      } as const;
      indexSchemaNodeWarning(node.runtime, key, node.path, record);
      node.runtime.chainOccurrences?.push({ kind: 'record', record });
    }
  }
  context.selectedDeclarationIds.set(node, active.map((declaration) => declaration.id));
  const effective = mergeEffectiveSchema(node.blueprintNode,
    active.map((declaration) => declaration.id), { mode: 'runtime' });
  if (effective.typeConflict) {
    recordSettlementFailure(context, new SchemaFormError(SHARED_NODE_CONFLICT,
      `Active declarations conflict at ${node.path}`, { path: node.path }), 'sharedConflict');
  }
  if (node.parent === null)
    node.active = active.some((declaration) => declaration.role === 'declaration');
  if (node.schema === effective) return false;
  node.schema = effective;
  context.changedNodes.add(node);
  return true;
};
