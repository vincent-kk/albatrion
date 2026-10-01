import type { Blueprint, BlueprintGate } from '../../../blueprint';
import type { GuardFunction } from '../../type';
import { readValidationEntry } from '../cache/readValidationEntry';
import { isValidator } from './isValidator';

/**
 * Lazily read one authored guard, preserving failed compilation for later trees.
 * @param runtime - Tree analysis and selected validator.
 * @param gate - Authored if position, including its schema pointer.
 * @returns The synchronous guard, or undefined when no validator was selected.
 * @throws The cached compiler error when this position could not compile.
 */
export const readSchemaNodeGuard = (
  runtime: { blueprint: Blueprint; validator?: unknown }, gate: BlueprintGate,
): GuardFunction | undefined => {
  const validator = runtime.validator;
  if (!isValidator(validator)) return undefined;
  const root = runtime.blueprint.schema;
  const entry = readValidationEntry(validator, root);
  const pointer = gate.schemaPath.startsWith('#')
    ? gate.schemaPath.slice(1) : gate.schemaPath;
  const cached = entry.guards.get(pointer);
  if (cached) {
    if ('failure' in cached) throw cached.failure;
    return cached.guard;
  }
  try {
    const guard = validator.compileGuard(entry.copy, pointer);
    entry.guards.set(pointer, { guard });
    return guard;
  } catch (failure) {
    entry.guards.set(pointer, { failure });
    throw failure;
  }
};
