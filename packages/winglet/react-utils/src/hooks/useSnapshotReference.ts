import { useRef } from 'react';

import { equals } from '@winglet/common-utils/object';

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
 * @remarks The identity gate is a `useRef`, never a `useMemo`: a memo's dependency record
 *          lives on the committed fiber, so a render React discards would leave its write
 *          to the snapshot behind while the deps that justified it roll back, and no later
 *          render carrying that same input could ever re-examine it. Refs roll back with
 *          nothing, so gate and write always move together.
 *
 * @remarks `omit` is captured on the first render that compares a new `input` reference,
 *          not on mount — the initial render has nothing to compare against, so it never
 *          reaches the capture. Later changes are ignored, so pass a value that stays
 *          fixed for the component's lifetime.
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
  const comparedRef = useRef(input);
  const omitKeysRef = useRef<Set<keyof Input> | undefined | null>(null);
  if (input !== comparedRef.current) {
    comparedRef.current = input;
    if (omitKeysRef.current === null)
      omitKeysRef.current =
        omit === undefined || omit instanceof Set ? omit : new Set(omit);
    if (!equals(snapshotRef.current, input, omitKeysRef.current))
      snapshotRef.current = input;
  }
  return snapshotRef;
};
