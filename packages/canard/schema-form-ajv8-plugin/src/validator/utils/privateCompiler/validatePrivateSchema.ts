import type { Ajv } from 'ajv';

import { instanceIdRegistrationsOf } from '../instanceIdRegistrationsOf';
import { createNativeCompiler } from './createNativeCompiler';
import { isPrivateCompilerCurrent } from './isPrivateCompilerCurrent';
import type { PrivateCompiler } from './types';

/**
 * Validate a detached authored root and return the exact meta kernel whose profile proves its validity.
 * @param source - Read-only application profile supplying current meta-schemas.
 * @param schema - Detached authored root, validated as data without retaining the caller object.
 * @returns The meta kernel proving validity, or undefined when schema validation is disabled.
 */
export const validatePrivateSchema = (
  source: Ajv,
  schema: object,
): PrivateCompiler | undefined => {
  if (source.opts.validateSchema === false) return;
  const ledger = instanceIdRegistrationsOf(source);
  const previous = ledger.meta;
  const compiler =
    previous && previous.count < 64 && isPrivateCompilerCurrent(previous)
      ? previous
      : createNativeCompiler(source, 'meta', true, false);
  ledger.meta = compiler;
  compiler.instance.validateSchema(
    schema,
    source.opts.validateSchema !== 'log',
  );
  return compiler;
};
