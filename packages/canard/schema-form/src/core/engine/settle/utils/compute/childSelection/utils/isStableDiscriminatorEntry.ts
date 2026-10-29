import type {
  BlueprintChildEntry,
  BlueprintNode,
} from '../../../../../blueprint';

/**
 * Prove that hoisted tag declarations change only validation constraints.
 * @param entry - Unique terminal candidate with its authored declaration order
 * @param host - Direct template host binding every discriminator to this tag
 * @returns Whether schema reselection cannot transform this watched scalar value
 */

export const isStableDiscriminatorEntry = (
  entry: BlueprintChildEntry,
  host: BlueprintNode,
): boolean => {
  const declarations = entry.declarations;
  const type = entry.node.schemaType;
  if (
    entry.node.strategy !== 'terminal' ||
    typeof type !== 'string' ||
    type === 'object' ||
    type === 'array' ||
    declarations.length < 2 ||
    entry.node.declarations.length !== declarations.length
  )
    return false;
  let hasUngated = false;
  for (const declaration of declarations)
    if (declaration.gates.length === 0) {
      hasUngated = true;
      break;
    }
  if (!hasUngated) return false;
  let hasGated = false;
  for (const declaration of declarations)
    if (declaration.gates.length > 0) {
      hasGated = true;
      break;
    }
  if (!hasGated) return false;
  for (let index = 0; index < declarations.length; index++) {
    const declaration = declarations[index];
    const schema = declaration.schema;
    if (
      declaration.id !== entry.node.declarations[index].id ||
      !schema ||
      typeof schema !== 'object' ||
      schema.type !== type
    )
      return false;
    for (const key of Object.keys(schema))
      if (
        key !== 'type' &&
        key !== 'const' &&
        key !== 'enum' &&
        !(key === 'default' && declaration.gates.length === 0)
      )
        return false;
    for (const gate of declaration.gates) {
      if (
        gate.kind !== 'discriminator' ||
        gate.hostPath !== host.path ||
        gate.appliesWhen?.length ||
        gate.condition.propertyName !== entry.name
      )
        return false;
      const values = gate.condition.values;
      for (let index = 0, count = values.length; index < count; index++) {
        if (!(index in values)) continue;
        const value = values[index];
        if (
          !(
            value === null ||
            typeof value === 'string' ||
            typeof value === 'boolean' ||
            (typeof value === 'number' && Number.isFinite(value))
          )
        )
          return false;
      }
    }
  }
  return true;
};
