import type { FieldNode } from '@/schema-form/core';
import {
  type InputPositions,
  isFocusElement,
  resolveFocusTarget,
} from '@/schema-form/helpers/focusTarget';

/**
 * Check the Focus candidate in each registered input position for the field.
 * @param inputPositions - The requesting form's committed positions.
 * @param target - Field identity to locate; disabled first controls do not count as mounted focus targets.
 * @returns Whether at least one position can receive the ordinary Focus request.
 */
export const isInputMounted = (
  inputPositions: InputPositions,
  target: FieldNode,
): boolean => {
  for (const [container, position] of inputPositions) {
    if (position.node !== target) continue;
    const candidate = resolveFocusTarget(container, position.focusTarget);
    if (
      candidate &&
      (!isFocusElement(candidate) ||
        (!candidate.matches(':disabled') &&
          candidate.getAttribute('aria-disabled') !== 'true'))
    )
      return true;
  }
  return false;
};
