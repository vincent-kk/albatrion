import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Browser viewport dimensions, in pixels. */
type WindowSize = {
  /** Inner width of the window. */
  width: number;
  /** Inner height of the window. */
  height: number;
};

/**
 * Size reported before the first measurement — the value rendered on the server and
 * on the hydrating render. Shared so every instance starts from one reference.
 */
const INITIAL_SIZE: WindowSize = { width: 0, height: 0 };

/**
 * Layout effect in the browser so the first measurement lands before paint; plain effect
 * on the server, where layout effects cannot run and React warns about them.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Tracks browser window dimensions with automatic updates on resize events.
 *
 * Subscribes to the window `resize` event and reports the current viewport size, letting
 * components adapt to changes that CSS media queries cannot express — computed grid
 * columns, viewport-relative sizing, or rendering a different component per breakpoint.
 *
 * ### Render Behavior
 * - **SSR**: renders `{ width: 0, height: 0 }`, matching the hydrating client render
 * - **First Measurement**: taken in a layout effect, so it is committed before the first
 *   paint and no `0 × 0` frame is visible
 * - **Unchanged Resizes**: a resize event that leaves both dimensions untouched skips the
 *   state update entirely, so no re-render is scheduled and the returned object keeps its
 *   identity
 * - **Debouncing**: resize fires frequently; for expensive downstream work, combine with
 *   `useDebounce`
 *
 * @example
 * ```tsx
 * const ResponsiveLayout = () => {
 *   const { width } = useWindowSize();
 *   return width < 768 ? <MobileNavigation /> : <DesktopNavigation />;
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Grid column count derived from the available width
 * const ResponsiveGrid = ({ items, minItemWidth = 250 }: Props) => {
 *   const { width } = useWindowSize();
 *   const columns = Math.max(1, Math.floor(width / minItemWidth));
 *   return <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>{...}</div>;
 * };
 * ```
 *
 * @returns The current window dimensions; `{ width: 0, height: 0 }` until the first
 *          client-side measurement
 */
export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>(INITIAL_SIZE);
  const measuredRef = useRef<WindowSize>(INITIAL_SIZE);
  useIsomorphicLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const measured = measuredRef.current;
      if (width === measured.width && height === measured.height) return;
      measuredRef.current = { width, height };
      setWindowSize(measuredRef.current);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};
