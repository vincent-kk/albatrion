import { registerEngineDerivedReset } from '../../../utils/cache/engineModes';
import type { BlueprintChildEntry, BlueprintNode } from '../../types/node';
import { getItemSchemaPath } from './getItemSchemaPath';

/** Entries belong to immutable templates and are allocated only for requested slots. */
let ENTRIES = new WeakMap<BlueprintNode, (readonly BlueprintChildEntry[])[]>();
registerEngineDerivedReset(() => {
  ENTRIES = new WeakMap<BlueprintNode, (readonly BlueprintChildEntry[])[]>();
});

/**
 * Bind every authored fold candidate to an array slot without creating runtime nodes.
 * @param template - Analyzed array template with prefix or common item blueprints
 * @param index - Nonnegative array position whose binding is requested
 * @returns Immutable bindings in authored candidate order, empty for undeclared slots
 */
export const getItemEntries = (
  template: BlueprintNode,
  index: number,
): readonly BlueprintChildEntry[] => {
  let entries = ENTRIES.get(template);
  if (!entries) {
    entries = [];
    ENTRIES.set(template, entries);
  }
  if (index in entries) return entries[index];
  const first = template.prefixItems?.[index] ?? template.item;
  const candidates = template.prefixItems?.[index]
    ? (template.prefixItemCandidates?.[index] ?? [template.prefixItems[index]])
    : (template.itemCandidates ?? (first ? [first] : []));
  const result: BlueprintChildEntry[] = [];
  for (const node of candidates) {
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
      if (process.env.NODE_ENV !== 'production') {
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
    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(declarations);
      Object.freeze(entry);
    }
    result.push(entry);
  }
  if (process.env.NODE_ENV !== 'production') Object.freeze(result);
  entries[index] = result;
  return result;
};
