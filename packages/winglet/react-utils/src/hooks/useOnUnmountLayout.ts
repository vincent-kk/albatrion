import { useLayoutEffect } from 'react';

import type { Fn } from '@aileron/declare';

import { useReference } from './useReference';

/**
 * Executes a cleanup function synchronously when the component unmounts, before browser painting.
 *
 * This hook is the synchronous version of `useOnUnmount`, using `useLayoutEffect` to ensure
 * cleanup runs before the browser reflows or repaints. This prevents visual glitches, layout
 * shifts, and DOM inconsistencies during component removal.
 *
 * ### When to Use Over useOnUnmount
 * - **Prevent Visual Flicker**: Remove DOM nodes before layout recalculation
 * - **Animation Cleanup**: Cancel in-progress animations before the next frame
 * - **Global Style Restoration**: Reset document/body styles before paint
 * - **Portal Management**: Remove portal containers before DOM updates
 * - **Synchronous Library APIs**: Clean up libraries that require immediate DOM cleanup
 *
 * ### Performance Warning
 * **This blocks browser painting** — use sparingly and only when synchronous cleanup
 * is essential to prevent visual artifacts. For most cleanup, prefer `useOnUnmount`.
 *
 * ### Handler Freshness
 * The handler passed on the most recent render is the one that runs, so it observes the
 * props and state of that render. The handler is never invoked on re-renders, only on
 * unmount.
 *
 * @example
 * ```typescript
 * // Portal cleanup that must happen before the next layout pass
 * const portalRoot = useRef<HTMLDivElement>();
 * useOnMountLayout(() => {
 *   portalRoot.current = document.createElement('div');
 *   document.body.appendChild(portalRoot.current);
 * });
 * useOnUnmountLayout(() => portalRoot.current?.remove());
 * ```
 *
 * @example
 * ```typescript
 * // Restore body styles captured on mount, before the browser repaints
 * const originalOverflowRef = useRef<string>();
 * useOnMountLayout(() => {
 *   originalOverflowRef.current = document.body.style.overflow;
 *   document.body.style.overflow = 'hidden';
 * });
 * useOnUnmountLayout(() => {
 *   document.body.style.overflow = originalOverflowRef.current ?? '';
 * });
 * ```
 *
 * @param handler - The cleanup function to execute synchronously when the component unmounts
 *
 * @see useOnUnmount - The non-blocking variant, correct for most cleanup
 */
export const useOnUnmountLayout = (handler: Fn) => {
  const handlerRef = useReference(handler);
  useLayoutEffect(() => () => handlerRef.current(), [handlerRef]);
};
