import {
  filter as filterArray,
  map as mapArray,
} from '@winglet/common-utils/array';

import {
  appendSegment,
  isDescendantPath,
} from '@/schema-form/helpers/jsonPointer';

import {
  FormErrorCode,
  FormWarningCode,
  SchemaFormError,
} from '../../../../../errors';
import { mergeEffectiveSchema } from '../../../blueprint';
import { captureFieldNodeChange, indexFieldNodeWarning } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { evaluateGate } from '../gates/evaluateGate';
import { getGateRegistry } from '../gates/getGateRegistry';
import { selectRootGateDeclarations } from './childSelection/gateSelection/selectRootGateDeclarations';
import { readOneOfBranch } from './utils/readOneOfBranch';

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
  const rootSelection = selectRootGateDeclarations(node, context);
  const active =
    rootSelection ??
    filterArray(node.blueprintNode.declarations, (declaration) => {
      for (const gate of declaration.gates)
        if (!evaluateGate(gate, context, node)) return false;
      return true;
    });

  if (node.runtime.errorReporter?.hasConsumer()) {
    const branches = new Map<string, number[]>();
    for (const declaration of active) {
      const crossed = readOneOfBranch(
        declaration.schemaPath,
        getGateRegistry(node.runtime).pathSegments(declaration.schemaPath),
      );
      if (!crossed) continue;
      let crossesBranch = false;
      for (const gate of declaration.gates)
        if (
          isDescendantPath(
            gate.schemaPath,
            appendSegment(crossed.oneOfPath, crossed.position),
          )
        ) {
          crossesBranch = true;
          break;
        }
      if (!crossesBranch) continue;
      const branch = Number(crossed.position);
      const selected = branches.get(crossed.oneOfPath) ?? [];
      if (selected.indexOf(branch) === -1) selected.push(branch);
      branches.set(crossed.oneOfPath, selected);
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
    mapArray(active, (declaration) => declaration.id),
  );
  const effective = mergeEffectiveSchema(
    node.blueprintNode,
    mapArray(active, (declaration) => declaration.id),
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

  if (node.parent === null) {
    let hasActiveDeclaration = false;
    for (let index = 0, count = active.length; index < count; index++) {
      const declaration = active[index];

      if (declaration.role === 'declaration') {
        hasActiveDeclaration = true;
        break;
      }
    }
    node.active = captureFieldNodeChange(node, 'active', hasActiveDeclaration);
  }
  if (node.schema === effective) return false;
  node.schema = captureFieldNodeChange(node, 'schema', effective);
  context.changedNodes.add(node);
  return true;
};
