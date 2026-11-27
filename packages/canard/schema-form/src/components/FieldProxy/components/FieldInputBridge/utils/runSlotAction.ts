import type { Nullable } from '@aileron/declare';

import { FieldLifecycleAction } from '@/schema-form/helpers/fieldLifecycle';
import type { InputPosition } from '@/schema-form/helpers/focusTarget';
import { resolveFocusTarget } from '@/schema-form/helpers/focusTarget';

/** First text-selectable control; buttons and selects must not intercept selection. */
const SELECT_SELECTOR = 'input, textarea';

/** Native text controls understood by the Select action. */
type SelectableElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * Apply combined actions once, preserving focus-before-selection command ordering.
 * @param container - This input position's container, null before mount or after removal.
 * @param action - Combined actions returned by the detached lifecycle queue or node command.
 * @param position - Committed input position with its current focus anchor.
 * @returns Nothing; eligible input elements receive the selected actions synchronously.
 */
export const runSlotAction = (
  container: Nullable<HTMLElement>,
  action: FieldLifecycleAction,
  position: InputPosition,
): void => {
  if (container && action & FieldLifecycleAction.Focus)
    resolveFocusTarget(container, position.focusTarget)?.focus();
  if (action & FieldLifecycleAction.Select) {
    const element =
      container?.querySelector<SelectableElement>(SELECT_SELECTOR);
    if (element && typeof element.select === 'function') element.select();
  }
};
