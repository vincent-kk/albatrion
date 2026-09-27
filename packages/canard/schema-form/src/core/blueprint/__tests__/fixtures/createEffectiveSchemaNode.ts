import type {
  BlueprintNode,
  BlueprintSchema,
  PropertyDeclaration,
} from '../../type';

/**
 * Construct a renderer-free node fixture for the effective-schema contract.
 * @param schemas - Contributions ordered by their authored fixture positions.
 * @param overrides - Node metadata needed by a particular contract example.
 * @param declarations - Per-contribution context or gate overrides.
 * @returns A complete structural node without constructing an engine instance.
 */
export const createEffectiveSchemaNode = (
  schemas: readonly BlueprintSchema[],
  overrides: Partial<BlueprintNode> = {},
  declarations: readonly Partial<PropertyDeclaration>[] = [],
): BlueprintNode => ({
  id: 0,
  path: '/value',
  schemaPath: '#/properties/value',
  kind: 'string',
  schemaType: 'string',
  nullable: false,
  strategy: 'terminal',
  childEntries: [],
  declarations: schemas.map((schema, id) => ({
    id,
    name: 'value',
    path: '/value',
    schemaPath: `#/allOf/${id}`,
    schema,
    fragmentId: id,
    role: 'declaration',
    context: 'conjunction',
    scope: 'node',
    validationOnly: false,
    gates: [],
    order: [id],
    inherited: false,
    hostPath: '',
    ...declarations[id],
  })),
  ...overrides,
});
