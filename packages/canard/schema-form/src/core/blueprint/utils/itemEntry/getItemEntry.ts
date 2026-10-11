import type { BlueprintChildEntry, BlueprintNode } from '../../type';
import { getItemSchemaPath } from './getItemEntry/utils/getItemSchemaPath';

/** Entries belong to immutable templates and are allocated only for requested slots. */
const ENTRIES = new WeakMap<
  BlueprintNode,
  (BlueprintChildEntry | undefined)[]
>();
/** Lazy records follow the same module-time mode as their owning blueprint. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Bind an array slot to its reusable item template without creating a runtime node.
 * @param template - Analyzed array template with prefix or common item blueprints
 * @param index - Nonnegative array position whose binding is requested
 * @returns Owned slot entry, frozen in development, or undefined without a blueprint
 */
export const getItemEntry = (
  template: BlueprintNode,
  index: number,
): BlueprintChildEntry | undefined => {
  let entries = ENTRIES.get(template);
  if (!entries) {
    entries = [];
    ENTRIES.set(template, entries);
  }
  if (index in entries) return entries[index];
  const node = template.prefixItems?.[index] ?? template.item;
  if (!node) {
    entries[index] = undefined;
    return undefined;
  }
  const name = String(index);
  const schemaPath = getItemSchemaPath(template, index, node);
  const declarations = [];
  for (let position = 0; position < node.declarations.length; position++) {
    const declaration = node.declarations[position];
    const binding = {
      ...declaration,
      gates: [...declaration.gates],
      order: [...declaration.order],
      name,
      path: node.path,
      hostPath: template.path,
      schemaPath:
        declaration.schemaPath === node.schemaPath
          ? schemaPath
          : declaration.schemaPath,
    };
    if (DEVELOPMENT) {
      Object.freeze(binding.order);
      Object.freeze(binding.gates);
      Object.freeze(binding);
    }
    declarations.push(binding);
  }
  const entry = {
    name,
    node,
    hostPath: template.path,
    declarations,
  };
  if (DEVELOPMENT) {
    Object.freeze(declarations);
    Object.freeze(entry);
  }
  entries[index] = entry;
  return entry;
};
