import {
  FormErrorCode,
  FormWarningCode,
  SchemaFormError,
} from '../../../../../errors';
import { mergeEffectiveSchema } from '../../../blueprint';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { indexFieldNodeWarning } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { evaluateGate } from '../gates/evaluateGate';
import { selectRootGateDeclarations } from './childSelection/gateSelection/selectRootGateDeclarations';

/** A schema path through a `oneOf` branch; captures the `oneOf` prefix and the branch index. */
const ONE_OF_BRANCH_PREFIX = /^(.*\/oneOf)\/(\d+)(?:\/|$)/;

/**
 * Recompute one node's active overlays and effective schema in a host round.
 * @param node - Current occurrence whose declarations may have changed gates
 * @param context - Projection and deferred failure for this settlement
 * @returns Whether the effective schema reference changed
 */
export const selectNodeSchema = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const active =
    selectRootGateDeclarations(node, context) ??
    node.blueprintNode.declarations.filter((declaration) =>
      declaration.gates.every((gate) => evaluateGate(gate, context, node)),
    );
  if (node.runtime.errorReporter?.hasConsumer()) {
    const branches = new Map<string, number[]>();
    for (const declaration of active) {
      const match = ONE_OF_BRANCH_PREFIX.exec(declaration.schemaPath);
      if (
        !match ||
        !declaration.gates.some((gate) =>
          gate.schemaPath.startsWith(match[1] + '/' + match[2] + '/'),
        )
      )
        continue;
      const branch = Number(match[2]);
      const selected = branches.get(match[1]) ?? [];
      if (!selected.includes(branch)) selected.push(branch);
      branches.set(match[1], selected);
    }
    for (const [schemaPath, selected] of branches) {
      if (selected.length < 2) continue;
      const code = FormWarningCode.MultipleGatedBranchesActive;
      const key = JSON.stringify([code, node.path, schemaPath]);
      if (node.runtime.warningKeys?.has(key)) continue;
      (node.runtime.warningKeys ??= new Set()).add(key);
      const record = {
        level: 'warning',
        code,
        path: node.path,
        schemaPath,
        message: 'Multiple gated oneOf branches are active at ' + schemaPath,
        details: { branches: selected },
      } as const;
      indexFieldNodeWarning(node.runtime, key, node.path, record);
      node.runtime.chainOccurrences?.push({ kind: 'record', record });
    }
  }
  context.selectedDeclarationIds.set(
    node,
    active.map((declaration) => declaration.id),
  );
  const effective = mergeEffectiveSchema(
    node.blueprintNode,
    active.map((declaration) => declaration.id),
    { mode: 'runtime', isAtomic: node.runtime.blueprint?.isAtomic },
  );
  if (effective.typeConflict) {
    recordSettlementFailure(
      context,
      new SchemaFormError(
        FormErrorCode.SharedNodeConflict,
        `Active declarations conflict at ${node.path}`,
        { path: node.path },
      ),
      'sharedConflict',
    );
  }
  if (node.parent === null)
    node.active = captureFieldNodeChange(
      node,
      'active',
      active.some((declaration) => declaration.role === 'declaration'),
    );
  if (node.schema === effective) return false;
  node.schema = captureFieldNodeChange(node, 'schema', effective);
  context.changedNodes.add(node);
  return true;
};
