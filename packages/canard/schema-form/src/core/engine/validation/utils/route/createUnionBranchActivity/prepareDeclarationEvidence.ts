import {
  JSONPointer as $,
  isDescendantPath,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { Blueprint, PropertyDeclaration } from '../../../../blueprint';

/** One authored gate rebound by following a fixed number of live parent links. */
interface DeclarationEvidence {
  /** Parent links from the selected declaration to the gate's host. */
  distance: number;
  /** Owning branch path, with an active-control suffix removed. */
  schemaPath: string;
}

/**
 * Prepare the immutable part of declaration-to-host binding once per routing pass.
 * @param blueprint - Declaration origins, including host-specific reference entries.
 * @returns Gate evidence indexed by selected declaration identity; unrelated hosts are omitted.
 */
export const prepareDeclarationEvidence = (
  blueprint: Blueprint,
): ReadonlyMap<number, readonly DeclarationEvidence[]> => {
  const declarations = new Map<number, PropertyDeclaration>();
  for (const node of blueprint.nodes) {
    for (const declaration of node.declarations)
      declarations.set(declaration.id, declaration);
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations)
        declarations.set(declaration.id, declaration);
  }
  const evidence = new Map<number, readonly DeclarationEvidence[]>();
  for (const declaration of declarations.values()) {
    const bindings: DeclarationEvidence[] = [];
    for (const gate of declaration.gates) {
      let path = declaration.path;
      if (path !== gate.hostPath && !isDescendantPath(path, gate.hostPath))
        continue;
      let distance = 0;
      while (path !== gate.hostPath) {
        path = resolvePointer(path, $.Parent);
        distance++;
      }
      bindings.push({
        distance,
        schemaPath:
          gate.kind === 'active'
            ? resolvePointer(
                resolvePointer(gate.schemaPath, $.Parent),
                $.Parent,
              )
            : gate.schemaPath,
      });
    }
    if (bindings.length) evidence.set(declaration.id, bindings);
  }
  return evidence;
};
