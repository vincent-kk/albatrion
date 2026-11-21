import { useRef } from 'react';

import { useSnapshotValue } from './utils/useSnapshotValue';

/**
 * Creates a ref holding a deep-compared snapshot whose `current` changes only when
 * the input's contents actually change.
 *
 * The ref object itself is referentially stable for the component's entire lifetime,
 * so it can sit in a dependency array without ever invalidating it. `current` is
 * replaced only when the new input differs from the stored snapshot under deep
 * comparison; a fresh reference carrying identical contents is discarded.
 *
 * ### When to Use vs useSnapshot
 * - **useSnapshotReference**: a stable ref for imperative access — timers, event
 *   handlers, cleanup functions — and for callbacks that must not be recreated
 * - **useSnapshot**: direct value access; the common case
 *
 * ### Comparison Cost
 * The deep comparison runs at most once per distinct `input` reference: repeating a render
 * with the same reference is skipped outright. A caller that rebuilds the object on every
 * render therefore pays one comparison per render, which is inherent to the question being
 * asked; a caller that keeps the reference stable pays nothing after the first.
 *
 * @remarks Snapshot and comparison caches publish only at commit. Suspended render
 * attempts cannot change imperative readers or the next committed comparison.
 * `omit` is captured on the first committed comparison of a new input reference.
 * Keep it fixed for the component lifetime.
 *
 * @example
 * ```tsx
 * // A callback that never changes identity yet always sees current data
 * const dataRef = useSnapshotReference(complexData);
 * const process = useCallback(() => transform(dataRef.current), [dataRef]);
 * ```
 *
 * @example
 * ```tsx
 * // Exclude volatile fields so they do not count as content changes
 * const messageRef = useSnapshotReference(message, ['timestamp', 'sequenceNumber']);
 * ```
 *
 * @typeParam Input - The type of the object to track (may be `undefined`)
 * @param input - The object to track with deep comparison
 * @param omit - Properties excluded from the comparison, captured once at the first comparison
 * @returns A stable ref whose `current` updates only on real content changes
 *
 * @see useSnapshot - Direct value access without the ref wrapper
 * @see useReference - An always-current ref with no comparison
 */
export const useSnapshotReference = <Input extends object | undefined>(
  input: Input,
  omit?: Set<keyof Input> | Array<keyof Input>,
) => {
  const snapshotRef = useRef(input);
  useSnapshotValue(snapshotRef, input, omit);
  return snapshotRef;
};
