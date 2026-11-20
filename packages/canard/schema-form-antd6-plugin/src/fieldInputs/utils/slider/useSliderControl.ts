import { type KeyboardEvent, useRef, useState } from 'react';

import type { getSliderBounds } from './getSliderBounds';

/**
 * Separate transient library coordinates from committed schema values.
 * @param bounds - Memoized decimal grid and coordinate conversion.
 * @param initial - Stored starting value; rendering preserves it in the form.
 * @param lazy - False publishes movement; omitted or true publishes commits.
 * @param locked - Block pointer, keyboard and callback changes when true.
 * @param onChange - Publish valid values, or undefined for an explicit clear.
 * @returns Draft state and event handlers that write only on user interaction.
 */
export const useSliderControl = (
  bounds: ReturnType<typeof getSliderBounds>,
  initial: number | null | undefined,
  lazy: boolean | undefined,
  locked: boolean | undefined,
  onChange: (value: number | undefined) => void,
) => {
  const [unset, setUnset] = useState(typeof initial !== 'number');
  const [draft, setDraft] = useState(() =>
    bounds.snap(typeof initial === 'number' ? initial : bounds.min),
  );
  const current = useRef(typeof initial === 'number' ? initial : bounds.min);
  const stored = useRef(initial);
  const pending = useRef<number | undefined>(undefined);
  const commit = (value: number) => {
    if (locked || bounds.empty || !Number.isFinite(value)) return;
    const valid = bounds.snap(value);
    current.current = valid;
    stored.current = valid;
    setDraft(valid);
    setUnset(false);
    onChange(valid);
  };
  const clear = () => {
    if (locked || bounds.empty) return;
    current.current = bounds.min;
    stored.current = undefined;
    pending.current = undefined;
    setDraft(bounds.min);
    setUnset(true);
    onChange(undefined);
  };
  const change = (value: number | null) => {
    if (value === null) {
      if (lazy === false) clear();
      return;
    }
    if (locked || bounds.empty || !Number.isFinite(value)) return;
    const valid = bounds.snap(bounds.fromLibrary(value));
    current.current = valid;
    setDraft(valid);
    if (lazy === false) commit(valid);
  };
  const complete = (value: number | null) => {
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
    setDraft(value);
    pending.current = value;
    if (lazy === false) commit(value);
  };
  const keyUp = (event: KeyboardEvent<HTMLElement>) => {
    const value = pending.current;
    pending.current = undefined;
    if (value === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    if (lazy !== false) commit(value);
  };
  return {
    unset,
    needsCommit: unset || stored.current !== draft,
    draft,
    change,
    complete,
    keyDown,
    keyUp,
  };
};
