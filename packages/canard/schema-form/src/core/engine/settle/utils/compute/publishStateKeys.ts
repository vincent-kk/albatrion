import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import { getFeatureNodeIndex } from '../../../blueprint';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { calculateStateKeys } from '../controls/calculateStateKeys';
import { isDependencyOwner } from '../dependencies/isDependencyOwner';
import { recordSettlementFailure } from '../errors/recordSettlementFailure';

/**
 * Write final local controls and defer all failed expressions until commit.
 * @param context - Calculated final shape and deferred failure list
 * @returns Nothing; record fields and changed nodes carry the result
 */
export const publishStateKeys = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const index = getFeatureNodeIndex(context.root.runtime.blueprint);
  if (!index.stateKeyNodes.size && !index.stateKeyChildren.size) return;
  const result = calculateStateKeys(
    context.root,
    context.stateDirtyNodes,
    context.selectedDeclarationIds,
    (source) =>
      context.kind === 'load' ||
      isDependencyOwner(context, source.path) ||
      context.shapeDirtyPaths.has(source.path),
  );
  for (const { node, visible, readOnly, disabled } of result.entries) {
    if (
      node.visible !== visible ||
      node.readOnly !== readOnly ||
      node.disabled !== disabled
    )
      context.changedNodes.add(node);
    node.visible = captureFieldNodeChange(node, 'visible', visible);
    node.readOnly = captureFieldNodeChange(node, 'readOnly', readOnly);
    node.disabled = captureFieldNodeChange(node, 'disabled', disabled);
  }
  for (const failure of result.failures) {
    const { path, schemaPath, cause } = failure;
    recordSettlementFailure(
      context,
      new SchemaFormError(
        FormErrorCode.ExpressionThrew,
        `State key expression failed at ${schemaPath}`,
        { path, schemaPath, cause },
      ),
      'expression',
    );
  }
};
