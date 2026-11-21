import type { FocusAnchor } from '../types/position';

/**
 * Identify a DOM anchor, including an element created by another document.
 * @param target - DOM element or imperative focus handle.
 * @returns Whether the target is a native element, including across realms.
 */
export const isFocusElement = (
  target: FocusAnchor,
): target is Element & FocusAnchor => {
  if (typeof Element === 'undefined') return false;
  if (target instanceof Element) return true;
  if (!('nodeType' in target && target.nodeType === 1 && 'ownerDocument' in target))
    return false;
  try {
    // A native receiver check distinguishes iframe elements from lookalike handles.
    Element.prototype.hasAttributes.call(target);
    return true;
  } catch {
    return false;
  }
};
