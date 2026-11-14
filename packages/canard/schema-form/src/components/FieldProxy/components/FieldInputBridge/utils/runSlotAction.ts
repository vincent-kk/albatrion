import type { Nullable } from '@aileron/declare';

import { FOCUS_SELECTOR } from '@/schema-form/constants/focus';
import { FieldLifecycleAction } from '@/schema-form/helpers/fieldLifecycle';

/** First text-selectable control; buttons and selects must not intercept selection. */
const SELECT_SELECTOR = 'input, textarea';

/** Native text controls understood by the Select action. */
type SelectableElement = HTMLInputElement | HTMLTextAreaElement;
/** Marked custom targets and native controls share the HTMLElement focus contract. */
type FocusableElement = HTMLElement;

/**
 * Apply combined actions once, preserving focus-before-selection command ordering.
 * @param container - This input position's container, null before mount or after removal.
 * @param action - Combined actions returned by the detached lifecycle queue or node command.
 * @returns Nothing; eligible input elements receive the selected actions synchronously.
 */
export const runSlotAction = (
  container: Nullable<HTMLElement>,
  action: FieldLifecycleAction,
): void => {
  if (action & FieldLifecycleAction.Focus)
    container?.querySelector<FocusableElement>(FOCUS_SELECTOR)?.focus();
  if (action & FieldLifecycleAction.Select) {
    const element =
      container?.querySelector<SelectableElement>(SELECT_SELECTOR);
    if (element && typeof element.select === 'function') element.select();
  }
};
