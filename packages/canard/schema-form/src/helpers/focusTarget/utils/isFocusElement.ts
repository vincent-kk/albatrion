import type { FocusAnchor } from '../types/position';

/**
 * Tell a DOM element anchor from an imperative focus handle.
 * @param target - DOM element or imperative focus handle.
 * @returns Whether the target is an element node; `resolveFocusTarget` then accepts it only while it is connected in the container's document.
 */
export const isFocusElement = (
  target: FocusAnchor,
): target is Element & FocusAnchor =>
  'nodeType' in target && target.nodeType === 1;
