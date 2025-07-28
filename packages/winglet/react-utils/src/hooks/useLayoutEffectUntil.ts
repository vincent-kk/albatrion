import { type DependencyList, useLayoutEffect, useRef } from 'react';

/**
 * Executes a layout effect synchronously until a specified condition is met, then stops permanently.
 *
 * This hook is the synchronous version of `useEffectUntil`, using `useLayoutEffect` to run
 * before the browser paints. It's ideal for DOM measurements and manipulations that must
 * complete before the user sees the screen update.
 *
 * ### When to Use Over useEffectUntil
 * - **DOM Measurements**: When you need accurate layout measurements before paint
 * - **Style Calculations**: Computing styles based on element dimensions
 * - **Scroll Position Management**: Restoring scroll positions without visual jumps
 * - **Animation Setup**: Initializing animation states to prevent flicker
 * - **Focus Management**: Setting focus without visual delays
 *
 * ### Behavior
 * - Runs synchronously after DOM mutations but before browser paint
 * - Blocks browser painting until completion (use sparingly)
 * - Once the effect returns `true`, it permanently stops executing
 * - The completion state persists across re-renders
 *
 * ### Performance Considerations
 * Since this runs synchronously and blocks painting, it can impact performance.
 * Only use when the synchronous behavior is necessary to prevent visual issues.
 *
 * @example
 * ```typescript
 * // Measure and adjust layout until it fits
 * useLayoutEffectUntil(() => {
 *   const element = ref.current;
 *   if (!element) return false;
 *
 *   const { width } = element.getBoundingClientRect();
 *   if (width > maxWidth) {
 *     element.style.fontSize = `${currentSize - 1}px`;
 *     setCurrentSize(prev => prev - 1);
 *     return false; // Keep adjusting
 *   }
 *   return true; // Fits perfectly
 * }, [currentSize, maxWidth]);
 *
 * // Restore scroll position without flicker
 * useLayoutEffectUntil(() => {
 *   const savedPosition = sessionStorage.getItem('scrollPos');
 *   if (!savedPosition) return true;
 *
 *   window.scrollTo(0, parseInt(savedPosition));
 *   sessionStorage.removeItem('scrollPos');
 *   return true; // Done restoring
 * }, []);
 *
 * // Initialize animation state before first paint
 * useLayoutEffectUntil(() => {
 *   const elements = document.querySelectorAll('.animate');
 *   if (elements.length === 0) return false;
 *
 *   elements.forEach(el => {
 *     el.style.opacity = '0';
 *     el.style.transform = 'translateY(20px)';
 *   });
 *   setAnimationReady(true);
 *   return true; // Initialization complete
 * }, []);
 * ```
 *
 * @typeParam Dependencies - The type of the dependency array
 * @param effect - A function that performs synchronous side effects and returns `true` when done
 * @param dependencies - Optional dependency array that triggers re-execution when changed
 */
export const useLayoutEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies?: Dependencies,
) => {
  const isCompleted = useRef(false);
  useLayoutEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
