import { type HTMLAttributes, memo } from 'react';

import { usePortalAnchorRef } from './context/usePortalContext';

/**
 * Defines the exact DOM location where Portal content will be rendered.
 *
 * The Anchor component creates a designated mounting point in the DOM tree where all Portal
 * content will be inserted. This component acts as a bridge between the logical Portal
 * component locations in your React tree and the physical DOM location where the content
 * should actually appear. It's essential for controlling the precise positioning and
 * styling context of portaled content.
 *
 * ### Use Cases
 * - **Layout Control**: Position portal content at specific locations in your page structure
 * - **Styling Context**: Provide CSS context (themes, variables) for portaled content
 * - **Z-Index Management**: Place anchor at appropriate stacking level for overlays
 * - **Accessibility**: Ensure portaled content appears in logical document flow for screen readers
 *
 * ### Key Features
 * - Creates a stable DOM reference point for portal rendering
 * - Accepts all standard HTML div attributes for styling and behavior
 * - Automatically connects to the nearest Portal context provider
 * - Supports multiple anchors within the same Portal context (first one wins)
 * - Maintains accessibility and document structure
 *
 * ### Positioning and Styling
 * - The anchor div can be styled like any regular div element
 * - Portal content inherits the styling context from the anchor's location
 * - CSS positioning, z-index, and containment apply from the anchor's parent elements
 * - The anchor itself can be positioned absolutely, relatively, or statically as needed
 *
 * @example
 * ```typescript
 * // Basic anchor placement
 * const BasicExample = Portal.with(() => {
 *   return (
 *     <div className="app">
 *       <main className="content">
 *         <Portal>
 *           <div className="overlay">This appears at the anchor</div>
 *         </Portal>
 *       </main>
 *
 *       <Portal.Anchor className="portal-root" />
 *     </div>
 *   );
 * });
 *
 * // Styled anchor for specific positioning
 * const PositionedExample = Portal.with(() => {
 *   return (
 *     <div className="container">
 *       <div className="sidebar">
 *         <Portal>
 *           <div className="tooltip">Sidebar tooltip</div>
 *         </Portal>
 *       </div>
 *
 *       <div className="main-content">
 *         Content here...
 *       </div>
 *
 *       <Portal.Anchor
 *         className="tooltip-anchor"
 *         style={{
 *           position: 'absolute',
 *           top: 0,
 *           right: 0,
 *           zIndex: 1000
 *         }}
 *       />
 *     </div>
 *   );
 * });
 *
 * // Multiple themed areas
 * const ThemedExample = Portal.with(() => {
 *   return (
 *     <div className="app">
 *       <div className="light-theme">
 *         <Portal>
 *           <div className="modal">Light themed modal</div>
 *         </Portal>
 *       </div>
 *
 *       <div className="dark-theme">
 *         <Portal.Anchor className="modal-container" />
 *       </div>
 *     </div>
 *   );
 * });
 *
 * // Accessibility-aware placement
 * const AccessibleExample = Portal.with(() => {
 *   return (
 *     <div>
 *       <nav aria-label="Main navigation">
 *         <Portal>
 *           <div role="dialog" aria-labelledby="modal-title">
 *             <h2 id="modal-title">Settings</h2>
 *           </div>
 *         </Portal>
 *       </nav>
 *
 *       <main>Main content</main>
 *
 *       <Portal.Anchor
 *         role="region"
 *         aria-label="Modal container"
 *         className="modal-region"
 *       />
 *     </div>
 *   );
 * });
 * ```
 *
 * @param props - All standard HTML div element attributes except children. Supports className, style, event handlers, ARIA attributes, etc.
 * @returns A div element that serves as the mounting point for Portal content. The div receives the portalAnchorRef for portal rendering
 */
export const Anchor = memo(
  (props: Omit<HTMLAttributes<HTMLDivElement>, 'children'>) => {
    const ref = usePortalAnchorRef();
    return <div {...props} ref={ref} />;
  },
);
