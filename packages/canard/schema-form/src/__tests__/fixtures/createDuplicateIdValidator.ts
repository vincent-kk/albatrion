import { vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import type { Validator } from '@/schema-form/core/engine/validation';

/** Build a duplicate-throwing registry whose guards never register copies.
 * @returns A validator and spies sharing registrations by string id. */
export const createDuplicateIdValidator = () => {
  const registered = new Map<string, BlueprintSchema>();
  const compile = vi.fn((copy: BlueprintSchema) => {
    if (
      typeof copy === 'object' &&
      copy !== null &&
      typeof copy.$id === 'string'
    ) {
      const old = registered.get(copy.$id);
      if (old && old !== copy)
        throw new Error('schema with key already exists');
      registered.set(copy.$id, copy);
    }
    return () => [];
  });
  const compileGuard = vi.fn((_copy: BlueprintSchema, _pointer: string) => {
    return (value: unknown) =>
      value !== null &&
      typeof value === 'object' &&
      Reflect.get(value, 'flag') === true;
  });
  const release = vi.fn((copy: BlueprintSchema) => {
    if (
      typeof copy === 'object' &&
      copy !== null &&
      typeof copy.$id === 'string' &&
      registered.get(copy.$id) === copy
    )
      registered.delete(copy.$id);
  });
  const validator: Validator = { compile, compileGuard, release };
  return { validator, compile, compileGuard, release, registered };
};
