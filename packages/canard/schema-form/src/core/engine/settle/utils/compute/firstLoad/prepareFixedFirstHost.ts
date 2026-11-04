import { captureFieldNodeChange } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { captureProjectionBaseline } from '../../dependencies/captureProjectionBaseline';
import { staticIds } from '../childSelection/staticIds';

/**
 * Retain one ordinary priming baseline and restore only schemas that gates can change.
 * @param node - Object host at its original wheel priming boundary
 * @param context - Invocation-owned mount preparation and ordinary dirty bookkeeping
 * @param constructed - True after ordinary prime has built every unconditional child
 * @returns Whether an existing baseline replaced this priming pass
 */
export const prepareFixedFirstHost = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  constructed = false,
): boolean => {
  const preparation = context.fixedFirstLoad;
  if (!preparation) return false;
  const plan = preparation.plan.hosts[node.blueprintNode.id];
  if (!plan) return false;
  const baseline = preparation.hosts.get(node);
  if (!baseline) {
    if (!constructed) return false;
    const affected = [];
    for (const entry of plan.entries) {
      const child = node.structure![entry.name];
      if (
        entry.declarations.some((declaration) => declaration.gates.length > 0)
      )
        affected.push({ child, schema: child.schema });
      else
        context.selectedDeclarationIds.set(
          child,
          staticIds(entry, node.blueprintNode),
        );
    }
    preparation.hosts.set(node, affected);
    return false;
  }
  for (const { child, schema } of baseline) {
    if (child.schema === schema) continue;
    captureProjectionBaseline(node, child, true, context);
    if (!context.originalSchemas.has(child.path))
      context.originalSchemas.set(child.path, child.schema);
    child.schema = captureFieldNodeChange(child, 'schema', schema);
    context.dirtyPaths.add(child.path);
    context.changedNodes.add(child);
  }
  return true;
};
