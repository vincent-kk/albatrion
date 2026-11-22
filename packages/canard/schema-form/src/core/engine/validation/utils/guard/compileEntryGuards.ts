import { toStandardSchemaPointer } from './toStandardSchemaPointer';

import type { Blueprint, BlueprintGate } from '../../../blueprint';
import type { ValidationEntry } from '../../types/validationEntry';
import type { Validator } from '../../types/validator';

/**
 * Precompile every authored if once for a development cache entry.
 * @param entry - Shared entry whose eager pass is marked once.
 * @param validator - Instance that owns the entry.
 * @param analysis - Authored positions in document order.
 * @returns Nothing; failed positions remain cached for consuming trees.
 */
export const compileEntryGuards = (
  entry: ValidationEntry,
  validator: Validator,
  analysis: Blueprint,
): void => {
  if (entry.isEagerCompiled) return;
  entry.isEagerCompiled = true;
  const gates: BlueprintGate[] = [];
  for (const node of analysis.nodes) {
    for (const declaration of node.declarations)
      gates.push(...declaration.gates);
    for (const child of node.childEntries)
      for (const declaration of child.declarations)
        gates.push(...declaration.gates);
  }
  for (const gate of gates) {
    if (gate.kind !== 'if') continue;
    const pointer = toStandardSchemaPointer(gate.schemaPath);
    if (entry.guards.has(pointer)) continue;
    try {
      entry.guards.set(pointer, {
        guard: validator.compileGuard(entry.copy, pointer),
      });
    } catch (failure) {
      entry.guards.set(pointer, { failure });
    }
  }
};
