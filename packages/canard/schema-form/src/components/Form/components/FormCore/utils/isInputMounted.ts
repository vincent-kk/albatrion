import { FOCUS_SELECTOR } from '@/schema-form/constants/focus';
import type { FieldNode } from '@/schema-form/core';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

/**
 * Match the Focus action's first marked target or native control in actual registered input positions.
 * @param manager - The requesting form's position registry, not arbitrary renderer wrappers.
 * @param target - Field identity to locate; disabled first controls do not count as mounted focus targets.
 * @returns Whether at least one position can receive the ordinary Focus request.
 */
export const isInputMounted = (
  manager: VirtualizationManager,
  target: FieldNode,
): boolean => {
  for (const container of manager.inputsOf(target)) {
    const element = container.querySelector(FOCUS_SELECTOR);
    if (
      element &&
      !element.matches(':disabled') &&
      element.getAttribute('aria-disabled') !== 'true'
    )
      return true;
  }
  return false;
};
