import { type KeyboardEvent, useLayoutEffect, useRef, useState } from 'react';

import type { getSliderBounds } from './getSliderBounds';
import { getSliderDisplayValue } from './getSliderDisplayValue';

/** The movement releases that Ant Design can turn into completion callbacks. */
const MOVEMENT_KEYS: readonly string[] = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
];

/**
 * Separate transient library coordinates from committed schema values.
 * @param bounds - Memoized decimal grid and coordinate conversion.
 * @param initial - Stored starting value; rendering preserves it in the form.
 * @param lazy - False publishes movement; omitted or true publishes commits.
 * @param locked - Block pointer, keyboard and callback changes when true.
 * @param readOnly - Use the read-only display conversion for the current render.
 * @param onChange - Publish valid values, or undefined for an explicit clear.
 * @returns Draft state and event handlers that write only on user interaction.
 */
export const useSliderControl = (
  bounds: ReturnType<typeof getSliderBounds>,
  initial: number | null | undefined,
  lazy: boolean | undefined,
  locked: boolean | undefined,
  readOnly: boolean | undefined,
  onChange: (value: number | undefined) => void,
) => {
  const [stored, setStored] = useState(initial);
  const [pendingDraft, setPendingDraft] = useState<number>();
  const current = useRef(typeof initial === 'number' ? initial : bounds.min);
  const pending = useRef<{ key: string; value: number } | undefined>(undefined);
  const pointer = useRef<'idle' | 'active' | 'canceled'>('idle');
  const isLocked = !!locked || bounds.empty;
  const draft = getSliderDisplayValue(
    stored,
    pendingDraft,
    bounds.min,
    readOnly ? bounds.getReadOnlyValue : bounds.snap,
    isLocked,
  );
  const unset =
    typeof stored !== 'number' && (isLocked || pendingDraft === undefined);
  useLayoutEffect(() => {
    if (!isLocked) return;
    pending.current = undefined;
    if (pointer.current === 'active') pointer.current = 'canceled';
    current.current = typeof stored === 'number' ? stored : bounds.min;
    setPendingDraft(undefined);
  }, [bounds.min, isLocked, stored]);
  const commit = (value: number) => {
    if (locked || bounds.empty || !Number.isFinite(value)) return;
    const valid = bounds.snap(value);
    current.current = valid;
    setStored(valid);
    setPendingDraft(undefined);
    onChange(valid);
  };
  const clear = () => {
    if (locked || bounds.empty) return;
    current.current = bounds.min;
    setStored(undefined);
    pending.current = undefined;
    setPendingDraft(undefined);
    onChange(undefined);
  };
  const beginPointer = () => {
    if (!isLocked) pointer.current = 'active';
  };
  const change = (value: number | null) => {
    if (pointer.current === 'canceled') return;
    if (value === null) {
      if (lazy === false) clear();
      return;
    }
    if (locked || bounds.empty || !Number.isFinite(value)) return;
    const valid = bounds.snap(bounds.fromLibrary(value));
    current.current = valid;
    setPendingDraft(valid);
    if (lazy === false) commit(valid);
  };
  const complete = (value: number | null) => {
    if (pointer.current === 'canceled') return;
    pointer.current = 'idle';
    if (value === null) clear();
    else if (Number.isFinite(value)) commit(bounds.fromLibrary(value));
  };
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (locked || bounds.empty) return;
    const { key, target } = event;
    // Ant Design positions RTL thumbs from the right edge, including with a custom CSS prefix.
    const rtl = target instanceof HTMLElement && target.style.right !== '';
    const navigationKey =
      rtl && key === 'ArrowLeft'
        ? 'ArrowRight'
        : rtl && key === 'ArrowRight'
          ? 'ArrowLeft'
          : key;
    const value = bounds.keyboard(
      navigationKey,
      current.current,
      event.shiftKey,
    );
    if (value === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    current.current = value;
    setPendingDraft(value);
    pending.current = { key, value };
    if (lazy === false) commit(value);
  };
  const keyUp = (event: KeyboardEvent<HTMLElement>) => {
    if (!MOVEMENT_KEYS.includes(event.key)) return;
    // After a remount, the library still completes a release it never started.
    event.preventDefault();
    event.stopPropagation();
    const movement = pending.current;
    if (movement?.key !== event.key) return;
    pending.current = undefined;
    if (lazy !== false) commit(movement.value);
  };
  return {
    unset,
    needsCommit: unset || stored !== draft,
    draft,
    change,
    complete,
    beginPointer,
    keyDown,
    keyUp,
  };
};
