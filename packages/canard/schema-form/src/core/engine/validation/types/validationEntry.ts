import type { SchemaFormError } from '../../../../errors';
import type { BlueprintSchema } from '../../blueprint';
import type { GuardFunction, ValidateFunction } from './validator';

/** Successful or failed compilation retained under one authored position. */
export type GuardResult =
  | { readonly guard: GuardFunction; readonly failure?: never }
  | { readonly failure: unknown; readonly guard?: never };

/** One validator/root cache entry shared by every consuming tree. */
export interface ValidationEntry {
  /** Deep copy given to whole-schema compilation. */
  readonly copy: BlueprintSchema;
  /** Authored-position guard compilation outcomes, including failures. */
  readonly guards: Map<string, GuardResult>;
  /** Whether the first whole-schema compile has been attempted, including a thrown undefined. */
  compiled: boolean;
  /** Whole-schema compilation result when successful. */
  validate?: ValidateFunction;
  /** Whole-schema compilation failure when it throws. */
  failure?: unknown;
  /** Duplicate-id registration observed while this compilation failed. */
  duplicate?: boolean;
  /** Whether the one whole-schema retry after a retained-id collision has been consumed. */
  retried?: boolean;
  /** Shared compile rejection identity for automatic reports and later explicit/native requests. */
  rejection?: SchemaFormError;
  /** Whether development guard precompilation has already run. */
  eagerCompiled: boolean;
}
