import { type KeyboardEvent, type ReactNode, useEffect, useRef } from 'react';

import type { FieldInputProps } from '@canard/schema-form';

import { getKeyboardValue } from '../utils/slider/getKeyboardValue';

/** Keyboard adapter for library thumbs that expose ARIA but no native keyboard input. */
interface SliderKeyboardControlProps {
  /** Library slider whose thumb nodes remain stable during value changes. */
  children: ReactNode;
  /** Core input address and the title address supplied by the renderer. */
  inputId: string;
  /** Core resolver for additional range thumbs. */
  getInputId: FieldInputProps['getInputId'];
  labelledBy?: string;
  /** Current draft value, updated on pointer moves as well as keyboard input. */
  value: number | [number, number];
  /** Hide the library placeholder value until the user selects a value. */
  unset: boolean;
  /** Inclusive bounds and step from the numeric schema. */
  min: number;
  max: number;
  step: number;
  /** Sorted mark positions, or an empty list for ordinary stepping. */
  stops: readonly number[];
  /** Whether focus and changes are blocked. */
  disabled: boolean;
  /** Update the keyboard draft through the same conversion as pointer moves. */
  onChange: (value: number | [number, number]) => void;
  /** Publish the final keyboard draft when its key is released. */
  onChangeCommitted?: (value: number | [number, number]) => void;
}

/**
 * Make the library's thumb nodes keyboard reachable without adding another visible control.
 * @param props - Slider child, current value and numeric navigation constraints.
 * @returns An event boundary that marks and operates each existing thumb.
 */
export const SliderKeyboardControl = ({
  children,
  inputId,
  getInputId,
  labelledBy,
  value,
  unset,
  min,
  max,
  step,
  stops,
  disabled,
  onChange,
  onChangeCommitted,
}: SliderKeyboardControlProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const keyboardCommit = useRef<number | [number, number] | undefined>(
    undefined,
  );
  useEffect(() => {
    const thumbs =
      ref.current?.querySelectorAll<HTMLElement>('[role="slider"]') ?? [];
    for (const [index, thumb] of Array.from(thumbs).entries()) {
      thumb.id = index === 0 ? inputId : getInputId(index);
      if (labelledBy) thumb.setAttribute('aria-labelledby', labelledBy);
      thumb.tabIndex = disabled ? -1 : 0;
      if (disabled) thumb.removeAttribute('data-focus-target');
      else thumb.setAttribute('data-focus-target', '');
    }
  }, [disabled, inputId, getInputId, labelledBy]);
  useEffect(() => {
    const thumbs =
      ref.current?.querySelectorAll<HTMLElement>('[role="slider"]') ?? [];
    for (const [index, thumb] of Array.from(thumbs).entries()) {
      if (unset) {
        thumb.removeAttribute('aria-valuenow');
        thumb.setAttribute('aria-valuetext', 'Not set');
        thumb.style.opacity = thumb === document.activeElement ? '1' : '0';
      } else {
        thumb.setAttribute(
          'aria-valuenow',
          String(Array.isArray(value) ? value[index] : value),
        );
        thumb.removeAttribute('aria-valuetext');
        thumb.style.opacity = '';
      }
    }
  }, [unset, value]);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const index = Array.from(
      ref.current?.querySelectorAll('[role="slider"]') ?? [],
    ).findIndex((thumb) => thumb === event.target);
    if (index < 0) return;
    const range = Array.isArray(value);
    const current = range ? value[index] : value;
    const lower = range && index === 1 ? value[0] : min;
    const upper = range && index === 0 ? value[1] : max;
    const next = getKeyboardValue(
      event.key,
      current,
      lower,
      upper,
      step,
      stops,
    );
    if (next === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    const draft: number | [number, number] = range
      ? index === 0
        ? [next, value[1]]
        : [value[0], next]
      : next;
    keyboardCommit.current = draft;
    onChange(draft);
  };
  return (
    <div
      ref={ref}
      style={{ display: 'contents' }}
      onKeyDownCapture={handleKeyDown}
      onKeyUpCapture={(event) => {
        const draft = keyboardCommit.current;
        keyboardCommit.current = undefined;
        if (draft === undefined) return;
        event.stopPropagation();
        if (!disabled) onChangeCommitted?.(draft);
      }}
      onFocusCapture={(event) => {
        if (unset && event.target instanceof HTMLElement)
          event.target.style.opacity = '1';
      }}
      onBlurCapture={(event) => {
        if (unset && event.target instanceof HTMLElement)
          event.target.style.opacity = '0';
      }}
    >
      {children}
    </div>
  );
};
