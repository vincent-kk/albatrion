import type { FieldNodeRecord } from '../../../record';
import type { InactiveValueContext } from '../../../types/controls';
import type { SettlementContext } from '../../types/settlement';
import { getLoadValue } from '../loadValues/getLoadValue';
import { getSlotPathNames } from '../slots/getSlotPathNames';

/**
 * Bind exit resolvers to the preceding committed emission and schemas.
 * @param node - Occurrence about to leave its last active lifetime
 * @param context - Settlement holding the previous emission and binding context
 * @returns The injectTo-shaped context without any current-round value reads
 */
export const getInactiveValueContext = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): InactiveValueContext => {
  const parent = node.parent;
  const root = context.root;
  return {
    dataPath: node.path,
    schemaPath: node.blueprintNode.schemaPath,
    jsonSchema: context.originalSchemas.get(node.path)?.schema ?? node.schema.schema,
    parentValue: parent ? getLoadValue(context.previousEmit, parent.path, getSlotPathNames(node.runtime, parent.path)) : null,
    parentJSONSchema: parent ? context.originalSchemas.get(parent.path)?.schema ?? parent.schema.schema : null,
    rootValue: context.previousEmit,
    rootJSONSchema: context.originalSchemas.get(root.path)?.schema ?? root.schema.schema,
    context: context.previousContext ?? {},
  };
};
