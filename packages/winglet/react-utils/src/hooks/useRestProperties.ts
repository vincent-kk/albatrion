import { useRef } from 'react';

import type { Dictionary } from '@aileron/declare';

/**
 * Maintains referential stability for object props by returning the previous reference when the contents are shallow-equal.
 *
 * React creates a new object reference on every render for inline literals, spreads and
 * computed objects, which breaks `React.memo`, `useMemo` and `useCallback` even when the
 * contents never changed. This hook compares the incoming object against the last one it
 * handed out and returns that earlier reference whenever every property still matches.
 *
 * ### Shallow Comparison Algorithm
 * 1. **Reference Check**: return immediately when the reference is unchanged
 * 2. **Repeat Check**: a reference already compared is answered from that verdict
 * 3. **Key Count Comparison**: a differing property count is a fast rejection
 * 4. **Value Comparison**: shallow (`!==`) comparison of every own enumerable property
 * 5. **Reference Preservation**: return the previous reference when the contents match
 *
 * ### Performance Characteristics
 * - **Best Case**: O(1) when the incoming reference was already seen
 * - **Typical Case**: O(n) where n is the number of properties, at most once per
 *   distinct incoming reference
 * - **Memory**: one previous reference, one compared reference and one key list per
 *   hook instance
 *
 * @example
 * ```tsx
 * // Stabilize a computed object so a memoized child stops re-rendering
 * const stableConfig = useRestProperties({ theme, userId: user.id });
 * return <ExpensiveChild config={stableConfig} />;
 * ```
 *
 * @example
 * ```tsx
 * // Stabilize forwarded rest props
 * const Button = ({ variant, children, ...restProps }: Props) => {
 *   const stableRestProps = useRestProperties(restProps);
 *   return <MemoizedButton variant={variant} {...stableRestProps}>{children}</MemoizedButton>;
 * };
 * ```
 *
 * @remarks The repeat gate is a `useRef`, never a `useMemo`: a memo's dependency record
 *          lives on the committed fiber, so a render React discards would leave its write
 *          to the retained reference behind while the deps that justified it roll back,
 *          and no later render carrying that same input could ever re-examine it. Refs
 *          roll back with nothing, so gate and write always move together.
 *
 * @typeParam T - The type of the properties object (must extend Dictionary)
 * @param props - The properties object to stabilize via shallow comparison
 * @returns The previous object reference when the contents are unchanged, otherwise the new object
 *
 * @see useSnapshot - Deep comparison for nested objects, at a higher comparison cost
 */
export const useRestProperties = <T extends Dictionary>(props: T): T => {
  const previousRef = useRef<T>(props);
  const previousKeysRef = useRef<string[] | null>(null);
  const comparedRef = useRef<T | null>(null);

  const previous = previousRef.current;
  if (!props || props === previous) return props;
  if (props === comparedRef.current) return previous;
  comparedRef.current = props;

  const keys = Object.keys(props);
  const previousKeys =
    previousKeysRef.current ?? (previous ? Object.keys(previous) : []);

  if (keys.length !== previousKeys.length) {
    previousRef.current = props;
    previousKeysRef.current = keys;
    return props;
  }

  for (let index = 0, length = keys.length; index < length; index++) {
    const key = keys[index];
    if (props[key] !== previous[key]) {
      previousRef.current = props;
      previousKeysRef.current = keys;
      return props;
    }
  }

  previousKeysRef.current = previousKeys;
  return previous;
};
