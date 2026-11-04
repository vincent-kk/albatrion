import type { FieldNodeRecord } from '../../../../record';

/**
 * Bind the eight legacy handler names to this round's emitted tree.
 * @param instance - Live injection source
 * @param root - Current calculated root
 * @returns Context passed unchanged to the authored handler
 */
export const getInjectToContext = <Self extends FieldNodeRecord<Self>>(
  instance: Self,
  root: Self,
) => ({
  dataPath: instance.path,
  schemaPath: instance.blueprintNode.schemaPath,
  jsonSchema: instance.schema.schema,
  parentValue: instance.parent ? instance.parent.emit : null,
  parentJSONSchema: instance.parent ? instance.parent.schema.schema : null,
  rootValue: root.emit,
  rootJSONSchema: root.schema.schema,
  context: root.runtime.context,
});
