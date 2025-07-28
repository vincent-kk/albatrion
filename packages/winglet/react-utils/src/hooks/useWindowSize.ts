import { useEffect, useState } from 'react';

/**
 * Tracks browser window dimensions with automatic updates on resize events.
 *
 * This hook subscribes to window resize events and provides real-time viewport dimensions,
 * enabling responsive components that adapt to window size changes. It handles event listener
 * cleanup automatically and provides initial size measurement after component mount.
 *
 * ### Use Cases
 * - **Responsive Components**: Adapt layout based on current viewport size
 * - **Conditional Rendering**: Show/hide elements based on available screen space
 * - **Dynamic Calculations**: Calculate dimensions relative to viewport (e.g., modals, overlays)
 * - **Breakpoint Logic**: Implement custom responsive breakpoints in JavaScript
 * - **Performance Optimization**: Render different components for mobile vs desktop
 * - **Accessibility**: Adjust UI density and touch targets based on screen size
 *
 * ### Performance Considerations
 * - **High Frequency Events**: Resize events fire frequently during window resizing
 * - **Debouncing Recommended**: For expensive computations, combine with `useDebounce`
 * - **SSR Compatibility**: Returns `{width: 0, height: 0}` on server-side
 * - **Memory Efficiency**: Automatically cleans up event listeners on unmount
 *
 * ### Responsive Design Patterns
 * Use this hook to implement responsive behavior that CSS media queries can't handle:
 * - Dynamic grid columns based on available width
 * - Conditional component rendering
 * - Viewport-aware animations and transitions
 * - Content sizing relative to viewport
 *
 * @example
 * ```typescript
 * // Basic responsive layout switching
 * const ResponsiveLayout = () => {
 *   const { width, height } = useWindowSize();
 *
 *   const isMobile = width < 768;
 *   const isTablet = width >= 768 && width < 1024;
 *   const isDesktop = width >= 1024;
 *
 *   // Content area sized to viewport
 *   return (
 *     <div className={`layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
 *       {isMobile ? (
 *         <MobileNavigation />
 *       ) : (
 *         <DesktopNavigation />
 *       )}
 *
 *       <main style={{ minHeight: height - 80 }}>
 *         <Content />
 *       </main>
 *     </div>
 *   );
 * };
 *
 * // Custom breakpoint hook composition
 * const useBreakpoint = () => {
 *   const { width } = useWindowSize();
 *
 *   return useMemo(() => {
 *     if (width < 480) return 'xs';
 *     if (width < 768) return 'sm';
 *     if (width < 1024) return 'md';
 *     if (width < 1280) return 'lg';
 *     if (width < 1536) return 'xl';
 *     return '2xl';
 *   }, [width]);
 * };
 *
 * const AdaptiveComponent = () => {
 *   const breakpoint = useBreakpoint();
 *
 *   const config = useMemo(() => {
 *     switch (breakpoint) {
 *       case 'xs': return { columns: 1, cardSize: 'small', showSidebar: false };
 *       case 'sm': return { columns: 2, cardSize: 'small', showSidebar: false };
 *       case 'md': return { columns: 2, cardSize: 'medium', showSidebar: true };
 *       case 'lg': return { columns: 3, cardSize: 'medium', showSidebar: true };
 *       default: return { columns: 4, cardSize: 'large', showSidebar: true };
 *     }
 *   }, [breakpoint]);
 *
 *   return (
 *     <div className={`responsive-grid grid-${config.columns}`}>
 *       // Component adapts to breakpoint
 *     </div>
 *   );
 * };
 *
 * // Dynamic grid with calculated columns
 * const ResponsiveGrid = ({ items, minItemWidth = 250 }) => {
 *   const { width } = useWindowSize();
 *
 *   const columns = Math.max(1, Math.floor(width / minItemWidth));
 *   const itemWidth = Math.floor((width - (columns + 1) * 20) / columns);
 *
 *   return (
 *     <div
 *       style={{
 *         display: 'grid',
 *         gridTemplateColumns: `repeat(${columns}, 1fr)`,
 *         gap: '20px',
 *         padding: '20px'
 *       }}
 *     >
 *       {items.map((item, index) => (
 *         <GridItem
 *           key={item.id}
 *           data={item}
 *           width={itemWidth}
 *         />
 *       ))}
 *     </div>
 *   );
 * };
 *
 * // Viewport-aware modal positioning
 * const AdaptiveModal = ({ isOpen, onClose, children }) => {
 *   const { width, height } = useWindowSize();
 *
 *   const modalStyle = useMemo(() => {
 *     const isMobile = width < 768;
 *
 *     if (isMobile) {
 *       // Full-screen on mobile
 *       return {
 *         position: 'fixed',
 *         top: 0,
 *         left: 0,
 *         width: '100%',
 *         height: '100%',
 *         transform: 'none'
 *       };
 *     } else {
 *       // Centered with max dimensions on desktop
 *       const maxWidth = Math.min(800, width * 0.9);
 *       const maxHeight = Math.min(600, height * 0.8);
 *
 *       return {
 *         position: 'fixed',
 *         top: '50%',
 *         left: '50%',
 *         transform: 'translate(-50%, -50%)',
 *         width: maxWidth,
 *         height: maxHeight,
 *         maxWidth: '90vw',
 *         maxHeight: '90vh'
 *       };
 *     }
 *   }, [width, height]);
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <>
 *       <div className="modal-backdrop" onClick={onClose} />
 *       <div className="modal" style={modalStyle}>
 *         {children}
 *       </div>
 *     </>
 *   );
 * };
 *
 * // Performance-optimized with debouncing
 * const DeboucedResponsiveChart = ({ data }) => {
 *   const windowSize = useWindowSize();
 *
 *   // Debounce resize events to prevent excessive chart re-renders
 *   const debouncedSize = useDebounce(() => windowSize, 250);
 *
 *   const chartDimensions = useMemo(() => {
 *     const { width, height } = debouncedSize;
 *     const chartWidth = Math.min(width - 40, 1200);
 *     const chartHeight = Math.min(height * 0.6, 400);
 *
 *     return { width: chartWidth, height: chartHeight };
 *   }, [debouncedSize]);
 *
 *   return (
 *     <div className="chart-container">
 *       <Chart
 *         data={data}
 *         width={chartDimensions.width}
 *         height={chartDimensions.height}
 *       />
 *     </div>
 *   );
 * };
 *
 * // Orientation-aware component
 * const OrientationSensitive = () => {
 *   const { width, height } = useWindowSize();
 *
 *   const orientation = width > height ? 'landscape' : 'portrait';
 *   const aspectRatio = (width / height).toFixed(2);
 *
 *   return (
 *     <div className={`app-${orientation}`}>
 *       <div className="viewport-info">
 *         <span>Size: {width} × {height}</span>
 *         <span>Orientation: {orientation}</span>
 *         <span>Aspect Ratio: {aspectRatio}</span>
 *       </div>
 *
 *       {orientation === 'landscape' ? (
 *         <LandscapeLayout />
 *       ) : (
 *         <PortraitLayout />
 *       )}
 *     </div>
 *   );
 * };
 *
 * // Fullscreen component with viewport sizing
 * const FullscreenCanvas = () => {
 *   const { width, height } = useWindowSize();
 *   const canvasRef = useRef<HTMLCanvasElement>(null);
 *
 *   useEffect(() => {
 *     const canvas = canvasRef.current;
 *     if (!canvas) return;
 *
 *     // Update canvas size to match viewport
 *     canvas.width = width;
 *     canvas.height = height;
 *
 *     // Update canvas rendering based on new size
 *     const ctx = canvas.getContext('2d');
 *     if (ctx) {
 *       redrawCanvas(ctx, width, height);
 *     }
 *   }, [width, height]);
 *
 *   return (
 *     <canvas
 *       ref={canvasRef}
 *       style={{
 *         position: 'fixed',
 *         top: 0,
 *         left: 0,
 *         width: '100vw',
 *         height: '100vh'
 *       }}
 *     />
 *   );
 * };
 *
 * // Responsive text sizing
 * const ScalingText = ({ children }) => {
 *   const { width } = useWindowSize();
 *
 *   const fontSize = useMemo(() => {
 *     // Scale font size based on viewport width
 *     const baseSize = 16;
 *     const scaleFactor = Math.max(0.8, Math.min(1.5, width / 1200));
 *     return baseSize * scaleFactor;
 *   }, [width]);
 *
 *   return (
 *     <div style={{ fontSize: `${fontSize}px` }}>
 *       {children}
 *     </div>
 *   );
 * };
 *
 * // Conditional loading based on screen size
 * const ConditionalFeatures = () => {
 *   const { width } = useWindowSize();
 *   const isLargeScreen = width >= 1200;
 *
 *   return (
 *     <div>
 *       <MainContent />
 *       // Only load heavy components on large screens
 *       {isLargeScreen && (
 *         <Suspense fallback={<div>Loading advanced features...</div>}>
 *           <AdvancedAnalytics />
 *           <RealTimeChart />
 *           <DetailedControls />
 *         </Suspense>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 *
 * @returns An object containing the current window dimensions:
 *   - width: The inner width of the window in pixels (0 during SSR)
 *   - height: The inner height of the window in pixels (0 during SSR)
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};
