import type { Ajv } from 'ajv';

import { createValidationCompiler } from './createValidationCompiler';

/**
 * Creates an asynchronous validator for an isolated schema root.
 * @param ajv - The active AJV instance whose options and extensions define validation.
 * @returns A compiler that preserves the authored schema and normalizes failures.
 * @throws ValidatorBindRefusedError if the instance can modify the input.
 */
export const createValidatorFactory = (ajv: Ajv) =>
  createValidationCompiler(ajv, new WeakMap());
