import type { FieldNodeRuntime } from '../../record';

/** Published entry metadata owned by the root's existing pair-keyed store. */
export type InactiveMemoEntry =
  NonNullable<FieldNodeRuntime<never>['inactiveValueEntries']> extends Map<
    string,
    infer Entry
  >
    ? Entry
    : never;

/** One selected path's replacement; absent sides mean removal or insertion. */
export interface InactiveMemoChange {
  readonly previous?: InactiveMemoEntry;
  readonly next?: InactiveMemoEntry;
}
