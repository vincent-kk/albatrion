import type { Nullable } from '@aileron/declare';

import type { BlueprintSchema } from '../../blueprint';
import type { ValidationIssue } from './issue';

/**
 * Synchronous guard verdict; asynchronous formats and keywords are unsupported.
 * @param value - Emitted value to check without modification.
 * @returns Whether this value satisfies the guard.
 */
export type GuardFunction = (value: unknown) => boolean;

/**
 * Returns the verdict for its input and never throws; a throw is an execution failure.
 * @param data - Emitted value to check without modifying it.
 * @returns Ordered issues, or null when the value is valid.
 */
export type ValidateFunction<Value = unknown> = (
  data: Value,
) => Nullable<
  Promise<Nullable<readonly ValidationIssue[]>> | readonly ValidationIssue[]
>;

/**
 * Compiles validation and synchronous guards for one engine-owned schema copy.
 * Core passes the emitted tree by reference to compile results and guards.
 * Validators and guards must not modify the received value or schema.
 * Not using value-modifying custom keywords (ajv `modifying: true`) is the consumer's responsibility.
 * Guards do not support asynchronous formats or keywords.
 */
export interface Validator {
  /**
   * Compile a schema copy into a validator that returns issues rather than throwing.
   * @param copy - Engine-owned validation copy of the authored root.
   * @returns A function that reports ordered validation issues.
   * @throws When compilation fails. A failure caused by a schema id that is already registered is classified as `reason: 'duplicateSchemaId'` and retried only when its message contains `already exists` or `resolves to more than one schema`, the duplicate-id messages of AJV 6, 7 and 8.
   */
  compile(copy: BlueprintSchema): ValidateFunction;
  /**
   * Compile a synchronous guard independently of whole-schema compilation.
   * @param root - Engine-owned copy root, whether or not `compile` has run for it.
   * @param pointer - Authored schema location preserved in the copy.
   * @returns A synchronous boolean predicate; registers the root independently when needed.
   */
  compileGuard(root: BlueprintSchema, pointer: string): GuardFunction;
  /**
   * Release engine-owned resources when a root leaves the cache.
   * @param root - Engine-owned copy root, whether or not `compile` has run for it.
   * @returns Nothing; discards root resources or does nothing if it was never registered.
   */
  release?(root: BlueprintSchema): void;
  /** JSON Schema dialect understood by this validator, when declared. */
  readonly dialect?: string;
}
