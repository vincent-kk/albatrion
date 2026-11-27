import { useMemo, useRef } from 'react';

import type { Dictionary } from '@aileron/declare';

import { equalRestSymbols } from './utils/equalRestSymbols';
import { useCommitEffect } from './utils/useCommitEffect';

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
 * 4. **Value Comparison**: shallow (`!==`) comparison of every own enumerable property;
 *    a key matches only when it is also an own enumerable key of the previous object, so a
 *    renamed key whose values compare equal — both `undefined`, or a value the previous
 *    object inherits — still counts as a change; each property is read once
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
 * @remarks Comparison caches publish only at commit. A suspended or abandoned
 * render cannot replace the previous object seen by later committed renders.
 *
 * @typeParam T - The type of the properties object (must extend Dictionary)
 * @param props - The properties object to stabilize via shallow comparison
 * @returns The previous object reference when the contents are unchanged, otherwise the new object
 *
 * @see useSnapshot - Deep comparison for nested objects, at a higher comparison cost
 */
export const useRestProperties = <T extends Dictionary>(props: T): T => {
  const holder = useRef<{ value: T; keys: string[] | null }>({
    value: props,
    keys: null,
  });
  const next = useMemo(() => {
    const previous = holder.current;
    if (!props || props === previous.value) return previous;
    const keys = Object.keys(props);
    const previousKeys =
      previous.keys ?? (previous.value ? Object.keys(previous.value) : []);
    if (keys.length !== previousKeys.length) return { value: props, keys };
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (
        props[key] !== previous.value[key] ||
        (key !== previousKeys[index] && !isEnumerable.call(previous.value, key))
      )
        return { value: props, keys };
    }
    if (!equalRestSymbols(props, previous.value)) return { value: props, keys };
    return previous.keys === null
      ? { value: previous.value, keys: previousKeys }
      : previous;
  }, [props]);
  useCommitEffect(() => {
    holder.current = next;
  }, [next]);
  return props ? next.value : props;
};

/** Check own enumerability independently of an object's prototype. */
const isEnumerable = Object.prototype.propertyIsEnumerable;
