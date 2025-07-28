import { type PropsWithChildren, memo, useEffect } from 'react';

import { usePortalContext } from './context/usePortalContext';

/**
 * Renders React components at a different location in the DOM tree while maintaining component hierarchy.
 *
 * This Portal component provides a powerful mechanism for rendering content outside of its normal
 * DOM hierarchy, allowing you to break out of CSS containment (like overflow:hidden) or z-index
 * stacking contexts. The content is rendered at the location of a designated Portal.Anchor component
 * while preserving the React component tree structure for event bubbling and context propagation.
 *
 * ### Use Cases
 * - **Modals and Overlays**: Render modal content at document root to avoid z-index issues
 * - **Tooltips and Popovers**: Position floating elements outside scrollable containers
 * - **Dropdown Menus**: Render dropdowns that extend beyond parent container boundaries
 * - **Notification Systems**: Display notifications at a consistent location regardless of trigger source
 *
 * ### Key Features
 * - Maintains React component hierarchy and context while changing DOM location
 * - Automatically registers and unregisters content on mount/unmount
 * - Preserves event bubbling through the React component tree
 * - Supports multiple Portal instances with unique identification
 * - Memory-optimized with automatic cleanup on component unmount
 *
 * ### Portal Lifecycle
 * - On mount: Registers children with the Portal context using a unique ID
 * - During updates: Re-registers with new content when children change
 * - On unmount: Automatically unregisters to prevent memory leaks
 * - Rendering: Content appears at Portal.Anchor location, not at Portal component location
 *
 * @example
 * ```typescript
 * // Basic modal usage
 * const ModalExample = Portal.with(() => {
 *   const [showModal, setShowModal] = useState(false);
 *   
 *   return (
 *     <div className="app">
 *       <button onClick={() => setShowModal(true)}>Open Modal</button>
 *       
 *       {showModal && (
 *         <Portal>
 *           <div className="modal-backdrop">
 *             <div className="modal">
 *               <h2>Modal Title</h2>
 *               <p>This content is rendered at the Portal.Anchor location!</p>
 *               <button onClick={() => setShowModal(false)}>Close</button>
 *             </div>
 *           </div>
 *         </Portal>
 *       )}
 *       
 *       <Portal.Anchor /> // Modal content appears here
 *     </div>
 *   );
 * });
 *
 * // Tooltip system
 * const TooltipExample = Portal.with(() => {
 *   const [tooltip, setTooltip] = useState(null);
 *   
 *   return (
 *     <div className="container">
 *       <button 
 *         onMouseEnter={() => setTooltip('Helpful tooltip text')}
 *         onMouseLeave={() => setTooltip(null)}
 *       >
 *         Hover me
 *       </button>
 *       
 *       {tooltip && (
 *         <Portal>
 *           <div className="tooltip">{tooltip}</div>
 *         </Portal>
 *       )}
 *       
 *       <Portal.Anchor className="tooltip-container" />
 *     </div>
 *   );
 * });
 *
 * // Multiple portals
 * const MultiPortalExample = Portal.with(() => {
 *   return (
 *     <div>
 *       <Portal><span>First portal content</span></Portal>
 *       <Portal><span>Second portal content</span></Portal>
 *       
 *       <div>Regular content here</div>
 *       
 *       <Portal.Anchor /> // Both portal contents render here
 *     </div>
 *   );
 * });
 * ```
 *
 * @param children - The React elements to render at the Portal.Anchor location. Can be any valid ReactNode
 * @returns null - This component doesn't render anything in its own location, content appears at the anchor
 */
export const Portal = memo(({ children }: PropsWithChildren) => {
  const { register, unregister } = usePortalContext();
  useEffect(() => {
    const id = register(children);
    return () => {
      if (id) unregister(id);
    };
  }, [children, register, unregister]);
  return null;
});
