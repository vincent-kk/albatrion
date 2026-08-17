import type { Operation } from './constant';

/** Fields every patch carries: the operation name and the target JSON Pointer. */
interface BasePatch {
  op: Operation;
  path: string;
}

/**
 * Asserts that the value at `path` equals `value`.
 *
 * @typeParam Value - Type of the expected value
 */
export interface TestPatch<Value> extends BasePatch {
  op: typeof Operation.TEST;
  value: Value;
}

/**
 * Inserts `value` at `path`, appending when the final segment is `-` on an array.
 *
 * @typeParam Value - Type of the inserted value
 */
export interface AddPatch<Value> extends BasePatch {
  op: typeof Operation.ADD;
  value: Value;
}

/**
 * Overwrites the existing value at `path` with `value`.
 *
 * @typeParam Value - Type of the replacement value
 */
export interface ReplacePatch<Value> extends BasePatch {
  op: typeof Operation.REPLACE;
  value: Value;
}

/** Deletes the value at `path`, which must exist. */
export interface RemovePatch extends BasePatch {
  op: typeof Operation.REMOVE;
}

/** Copies the value at `from` to `path`, leaving the source in place. */
export interface CopyPatch extends BasePatch {
  op: typeof Operation.COPY;
  from: string;
}

/** Moves the value at `from` to `path`, removing the source. */
export interface MovePatch extends BasePatch {
  op: typeof Operation.MOVE;
  from: string;
}

/**
 * Any single JSON Patch operation.
 *
 * The value-carrying members are widened to `any` because a patch document is
 * consumed as parsed JSON, where the value type is not known until the pointer is
 * resolved against the target document.
 */
export type Patch =
  | TestPatch<any>
  | AddPatch<any>
  | ReplacePatch<any>
  | RemovePatch
  | MovePatch
  | CopyPatch;
