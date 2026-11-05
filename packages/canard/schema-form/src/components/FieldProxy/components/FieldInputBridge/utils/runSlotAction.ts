import type { Nullable } from '@aileron/declare';

import { FOCUS_SELECTOR, SELECT_SELECTOR } from '@/schema-form/constants/focus';
import { FieldLifecycleAction } from '@/schema-form/helpers/fieldLifecycle';

/** Native text controls understood by the Select action. */
type SelectableElement = HTMLInputElement | HTMLTextAreaElement;
/** Native controls understood by the Focus action. */
type FocusableElement =
  | SelectableElement
  | HTMLSelectElement
  | HTMLButtonElement;

/**
 * Apply combined actions once, preserving focus-before-selection command ordering.
 * @param container - This input position's container, null before mount or after removal.
 * @param action - Combined actions returned by the detached lifecycle queue or node command.
 */
export const runSlotAction = (
  container: Nullable<HTMLElement>,
  action: FieldLifecycleAction,
): void => {
  if (action & FieldLifecycleAction.Focus)
    queryElement(container, FOCUS_SELECTOR)?.focus();
  if (action & FieldLifecycleAction.Select) {
    const element =
      container?.querySelector<SelectableElement>(SELECT_SELECTOR);
    if (element && typeof element.select === 'function') element.select();
  }
};

/** Return the first native control for a supported selector, or null without a mounted container. */
const queryElement = (
  container: Nullable<HTMLElement>,
  selector: string,
): Nullable<FocusableElement> =>
  container?.querySelector<FocusableElement>(selector) ?? null;
