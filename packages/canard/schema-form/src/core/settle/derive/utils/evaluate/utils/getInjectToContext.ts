import type { SchemaNodeRecord } from '../../../../../record';

/**
 * Bind the eight legacy handler names to this round's emitted tree.
 * @param source - Live injection source
 * @param root - Current calculated root
 * @returns Context passed unchanged to the authored handler
 */
export const getInjectToContext = <Self extends SchemaNodeRecord<Self>>(
  source: Self, root: Self,
) => ({
  dataPath: source.path,
  schemaPath: source.blueprintNode.schemaPath,
  jsonSchema: source.schema.schema,
  parentValue: source.parent ? source.parent.emit : null,
  parentJSONSchema: source.parent ? source.parent.schema.schema : null,
  rootValue: root.emit,
  rootJSONSchema: root.schema.schema,
  context: root.runtime.context ?? {},
});
