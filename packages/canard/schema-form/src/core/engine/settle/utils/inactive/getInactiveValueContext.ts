import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { InactiveValueContext } from '../../../types/controls';
import type { SettlementContext } from '../../types/settlement';
import { getLoadValue } from '../loadValues/getLoadValue';
import { getSlotPathNames } from '../slots/getSlotPathNames';

/**
 * Bind exit resolvers to the preceding committed output value and schemas.
 * @param node - Occurrence about to leave its last active lifetime
 * @param context - Settlement holding the previous output value and binding context
 * @returns The injectTo-shaped context without any current-round value reads
 */
export const getInactiveValueContext = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): InactiveValueContext => {
  const parent = node.__parent__;
  const root = context.root;
  const origins = context.pathChanges.length
    ? readPathOrigins(context)
    : undefined;
  const path = origins?.get(node) ?? node.path;
  const parentPath = parent ? (origins?.get(parent) ?? parent.path) : $.Root;
  return {
    dataPath: path,
    schemaPath: node.blueprintNode.schemaPath,
    jsonSchema:
      context.originalSchemas.get(node.path)?.schema ?? node.__schema__.schema,
    parentValue: parent
      ? getLoadValue(
          context.previousOutputValue,
          parentPath,
          getSlotPathNames(node.runtime, parentPath),
        )
      : null,
    parentJSONSchema: parent
      ? (context.originalSchemas.get(parent.path)?.schema ??
        parent.__schema__.schema)
      : null,
    rootValue: context.previousOutputValue,
    rootJSONSchema:
      context.originalSchemas.get(root.path)?.schema ?? root.__schema__.schema,
    context: context.previousContext ?? {},
  };
};

/**
 * Index previous addresses once for configured exits in a moving settlement.
 * @param context - Call-local move log
 * @returns First committed address per moved occurrence
 */
const readPathOrigins = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): Map<Self, string> => {
  if (context.inactivePathOrigins) return context.inactivePathOrigins;
  const origins = new Map<Self, string>();
  for (const change of context.pathChanges)
    if (!origins.has(change.node)) origins.set(change.node, change.previous);
  return (context.inactivePathOrigins = origins);
};
