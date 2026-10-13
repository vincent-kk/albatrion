import { createBlueprintGate } from '../../createBlueprintGate';
import type { MutableNode, SchemaInput } from '../../type';

/**
 * Append host-owned bindings for constructed templates in their existing order.
 * A binding's gates are the referring input's gates followed by the template's own
 * declaration gates rebound to this occurrence, so an edge that reaches a template
 * through recursion carries its own host's gates instead of the first visit's absolute
 * host path (211C-01).
 * @param node - Writable host whose child entries receive the bindings
 * @param name - Authored property name shared by these kind templates
 * @param path - Escaped property occurrence at the current host
 * @param schemaPath - First input's authored position for shared templates
 * @param children - Constructed templates in the owner's DFS order
 * @param inputs - Construction inputs that produced or reused these templates
 * @param declarationInputs - Declaration id to the index of the input it was collected from
 * @returns Nothing; preserves template identity and copies binding memberships
 */
export const appendChildEntries = (
  node: MutableNode,
  name: string,
  path: string,
  schemaPath: string,
  children: MutableNode[],
  inputs: readonly SchemaInput[],
  declarationInputs: ReadonlyMap<number, number>,
): void => {
  const entries = node.childEntries;
  for (let childIndex = 0; childIndex < children.length; childIndex++) {
    const child = children[childIndex];
    const declarations = [];
    for (let index = 0; index < child.declarations.length; index++) {
      const declaration = child.declarations[index];
      const gates =
        inputs[declarationInputs.get(declaration.id) ?? 0].gates.slice();
      for (
        let gateIndex = 0;
        gateIndex < declaration.gates.length;
        gateIndex++
      ) {
        const gate = declaration.gates[gateIndex];
        if (gate.hostPath === child.path)
          gates.push(createBlueprintGate({ ...gate, hostPath: path }));
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
      if (process.env.NODE_ENV !== 'production') {
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
    if (process.env.NODE_ENV !== 'production') {
      Object.freeze(declarations);
      Object.freeze(entry);
    }
    entries.push(entry);
  }
};
