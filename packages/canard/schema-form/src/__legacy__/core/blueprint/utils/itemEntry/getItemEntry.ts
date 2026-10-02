import type { BlueprintChildEntry, BlueprintNode } from '../../type';
import { getItemSchemaPath } from './getItemEntry/utils/getItemSchemaPath';

/** Entries belong to immutable templates and are allocated only for requested slots. */
const ENTRIES = new WeakMap<BlueprintNode, (BlueprintChildEntry | undefined)[]>();

/**
 * Bind an array slot to its reusable item template without creating a runtime node.
 * @param template - Analyzed array template with prefix or common item blueprints
 * @param index - Nonnegative array position whose binding is requested
 * @returns Frozen slot entry, or undefined when the position has no blueprint
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
  const declarations = Object.freeze(
    node.declarations.map((declaration) =>
      Object.freeze({
        ...declaration,
        name,
        path: node.path,
        hostPath: template.path,
        schemaPath:
          declaration.schemaPath === node.schemaPath
            ? schemaPath
            : declaration.schemaPath,
      }),
    ),
  );
  const entry = Object.freeze({
    name,
    node,
    hostPath: template.path,
    declarations,
  });
  entries[index] = entry;
  return entry;
};
