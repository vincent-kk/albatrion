import type { BlueprintChildEntry } from '../../../../type';
import { createBlueprintGate } from '../../createBlueprintGate';
import type { MutableNode } from '../../type';

/** Host binding memberships are protected only in development. */
const DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Append host-owned bindings for constructed templates in their existing order.
 * @param node - Writable host whose child entries receive the bindings
 * @param name - Authored property name shared by these kind templates
 * @param path - Escaped property occurrence at the current host
 * @param schemaPath - First input's authored position for shared templates
 * @param children - Constructed templates in the owner's DFS order
 * @returns Nothing; preserves template identity and copies binding memberships
 */
export const appendChildEntries = (
  node: MutableNode,
  name: string,
  path: string,
  schemaPath: string,
  children: MutableNode[],
): void => {
  const entries = node.childEntries as BlueprintChildEntry[];
  for (let childIndex = 0; childIndex < children.length; childIndex++) {
    const child = children[childIndex];
    const declarations = [];
    for (let index = 0; index < child.declarations.length; index++) {
      const declaration = child.declarations[index];
      const gates = [];
      for (let gateIndex = 0; gateIndex < declaration.gates.length; gateIndex++) {
        const gate = declaration.gates[gateIndex];
        gates.push(
          gate.hostPath === child.path
            ? createBlueprintGate({ ...gate, hostPath: path })
            : gate,
        );
      }
      const binding = {
        ...declaration,
        order: [...declaration.order],
        name,
        path,
        hostPath: node.path,
        schemaPath:
          declaration.schemaPath === child.schemaPath
            ? schemaPath
            : declaration.schemaPath,
        gates,
      };
      if (DEVELOPMENT) {
        Object.freeze(binding.order);
        Object.freeze(gates);
        Object.freeze(binding);
      }
      declarations.push(binding);
    }
    const entry = {
      name,
      node: child,
      hostPath: node.path,
      declarations,
    };
    if (DEVELOPMENT) {
      Object.freeze(declarations);
      Object.freeze(entry);
    }
    entries.push(entry);
  }
};
