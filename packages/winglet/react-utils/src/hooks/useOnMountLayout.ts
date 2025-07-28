import { type EffectCallback, useLayoutEffect } from 'react';

/**
 * Executes a side effect synchronously only once when the component mounts, before the browser paints.
 *
 * This hook is the synchronous version of `useOnMount`, using `useLayoutEffect` to ensure
 * the effect runs before the browser updates the screen. This makes it ideal for DOM
 * manipulations that must complete before the user sees the initial render.
 *
 * ### When to Use Over useOnMount
 * - **Preventing Flash of Unstyled Content (FOUC)**: Apply styles before first paint
 * - **Initial DOM Measurements**: Get accurate dimensions for layout calculations
 * - **Scroll Position Restoration**: Set scroll position without visible jumps
 * - **Focus Management**: Set initial focus without delay
 * - **Third-party UI Libraries**: Initialize libraries that manipulate DOM immediately
 *
 * ### Performance Warning
 * Since this blocks painting, use sparingly. Only use when synchronous behavior
 * is necessary to prevent visual issues.
 *
 * @example
 * ```typescript
 * // Prevent layout shift by measuring before paint
 * useOnMountLayout(() => {
 *   const element = containerRef.current;
 *   if (!element) return;
 *
 *   const height = element.scrollHeight;
 *   element.style.height = '0px';
 *
 *   // Trigger reflow for animation
 *   element.offsetHeight;
 *   element.style.height = `${height}px`;
 * });
 *
 * // Apply theme before first paint to prevent flicker
 * useOnMountLayout(() => {
 *   const savedTheme = localStorage.getItem('theme');
 *   if (savedTheme === 'dark') {
 *     document.documentElement.classList.add('dark-mode');
 *   }
 * });
 *
 * // Initialize tooltip library that needs immediate DOM access
 * useOnMountLayout(() => {
 *   const tooltips = tippy('[data-tooltip]', {
 *     placement: 'top',
 *     animation: 'fade',
 *   });
 *
 *   return () => {
 *     tooltips.forEach(instance => instance.destroy());
 *   };
 * });
 *
 * // Restore scroll position without jump
 * useOnMountLayout(() => {
 *   const scrollY = sessionStorage.getItem('scrollPosition');
 *   if (scrollY) {
 *     window.scrollTo(0, parseInt(scrollY, 10));
 *     sessionStorage.removeItem('scrollPosition');
 *   }
 * });
 *
 * // Set initial focus for accessibility
 * useOnMountLayout(() => {
 *   const firstInput = document.querySelector<HTMLInputElement>(
 *     'input:not([disabled]), textarea:not([disabled])'
 *   );
 *   firstInput?.focus();
 * });
 * ```
 *
 * @param handler - The effect function to execute synchronously on mount. Can return a cleanup function
 */
export const useOnMountLayout = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(handler, []);
};
