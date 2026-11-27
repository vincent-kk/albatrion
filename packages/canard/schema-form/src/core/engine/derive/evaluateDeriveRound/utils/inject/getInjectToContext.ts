import type { FieldNodeRecord } from '../../../../record';

/**
 * Bind the eight legacy handler names to this round's emitted tree.
 * @param source - Live injection source
 * @param root - Current calculated root
 * @returns Context passed unchanged to the authored handler
 */
export const getInjectToContext = <Self extends FieldNodeRecord<Self>>(
  source: Self,
  root: Self,
) => ({
  dataPath: source.path,
  schemaPath: source.blueprintNode.schemaPath,
  jsonSchema: source.__schema__.schema,
  parentValue: source.__parent__ ? source.__parent__.__outputValue__ : null,
  parentJSONSchema: source.__parent__
    ? source.__parent__.__schema__.schema
    : null,
  rootValue: root.__outputValue__,
  rootJSONSchema: root.__schema__.schema,
  context: root.runtime.context,
});
