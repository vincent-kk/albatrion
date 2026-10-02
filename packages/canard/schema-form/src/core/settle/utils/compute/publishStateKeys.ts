import { recordSettlementFailure } from '../errors/recordSettlementFailure';
import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { calculateStateKeys } from '../controls/calculateStateKeys';
import { EXPRESSION_THREW } from '../errors/settleErrorCode';
import { declaresStateKeys } from '../controls/declaresStateKeys';

/**
 * Write final local controls and defer all failed expressions until commit.
 * @param context - Calculated final shape and deferred failure list
 * @returns Nothing; record fields and changed nodes carry the result
 */
export const publishStateKeys = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (!declaresStateKeys(context.root.runtime.blueprint)) return;
  const result = calculateStateKeys(context.root, context.stateDirtyNodes,
    context.selectedDeclarationIds, (source) => context.kind === 'load' ||
      context.dependencyOwnerPaths.has(source.path) ||
      context.shapeDirtyPaths.has(source.path));
  for (const { node, visible, readOnly, disabled } of result.entries) {
    if (node.visible !== visible || node.readOnly !== readOnly ||
      node.disabled !== disabled) context.changedNodes.add(node);
    node.visible = visible;
    node.readOnly = readOnly;
    node.disabled = disabled;
  }
  for (const failure of result.failures) {
    const { path, schemaPath, cause } = failure;
    recordSettlementFailure(context, new SchemaFormError(EXPRESSION_THREW,
      `State key expression failed at ${schemaPath}`,
      { path, schemaPath, cause }), 'expression');
  }
};
