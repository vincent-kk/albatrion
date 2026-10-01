import type { Blueprint, BlueprintGate } from '../../../blueprint';
import type { Validator } from '../../type';
import type { ValidationEntry } from '../cache/readValidationEntry';

/**
 * Precompile every authored if once for a development cache entry.
 * @param entry - Shared entry whose eager pass is marked once.
 * @param validator - Instance that owns the entry.
 * @param analysis - Authored positions in document order.
 * @returns Nothing; failed positions remain cached for consuming trees.
 */
export const compileEntryGuards = (
  entry: ValidationEntry, validator: Validator, analysis: Blueprint,
): void => {
  if (entry.eagerCompiled) return;
  entry.eagerCompiled = true;
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
    const pointer = gate.schemaPath.startsWith('#')
      ? gate.schemaPath.slice(1) : gate.schemaPath;
    if (entry.guards.has(pointer)) continue;
    try { entry.guards.set(pointer,
      { guard: validator.compileGuard(analysis.schema, pointer) }); }
    catch (failure) { entry.guards.set(pointer, { failure }); }
  }
};
