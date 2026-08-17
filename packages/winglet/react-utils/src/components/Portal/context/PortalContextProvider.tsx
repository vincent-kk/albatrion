import {
  Fragment,
  type PropsWithChildren,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { PortalContext } from './PortalContext';

/**
 * Manages the infrastructure for Portal functionality within a React component tree.
 *
 * This context provider creates and maintains the necessary state management for Portal
 * components to function properly. It handles the registration and unregistration of
 * portal content, manages the DOM anchor reference, and coordinates the rendering of
 * all portal content through React's createPortal API. The provider acts as the central
 * orchestrator for all portal operations within its scope.
 *
 * ### Key Responsibilities
 * - **Portal Registration**: Maintains a registry of all active Portal components with unique IDs
 * - **Lifecycle Management**: Handles mounting and unmounting of portal content automatically
 * - **DOM Coordination**: Manages the connection between Portal components and their Anchor
 * - **Rendering Orchestration**: Uses React portals to render content at the correct DOM location
 *
 * ### Internal Architecture
 * - Uses useState to track registered portal components with unique identifiers
 * - Maintains a ref to the DOM anchor element where content will be rendered
 * - Provides registration/unregistration functions through context value
 * - Renders all registered portal content using React's createPortal when anchor is available
 *
 * ### Performance Considerations
 * - Context value is memoized to prevent unnecessary re-renders of consuming components
 * - Portal content is rendered only when the anchor DOM element exists
 * - Each portal component gets a unique ID to enable efficient updates and removals
 * - Uses Fragment keys to optimize React's reconciliation of portal content
 *
 * @example
 * ```typescript
 * // The PortalContextProvider is typically used internally by withPortal HOC
 * // but can be used directly for custom implementations:
 *
 * const CustomPortalSetup = () => {
 *   return (
 *     <PortalContextProvider>
 *       <div className="app">
 *         <SomeComponent>
 *           <Portal>
 *             <div>This will be portaled</div>
 *           </Portal>
 *         </SomeComponent>
 *
 *         <Portal.Anchor className="portal-destination" />
 *       </div>
 *     </PortalContextProvider>
 *   );
 * };
 *
 * // Multiple portals managed by single provider
 * const MultiPortalExample = () => {
 *   return (
 *     <PortalContextProvider>
 *       <div>
 *         <Portal>
 *           <ModalComponent />
 *         </Portal>
 *
 *         <Portal>
 *           <TooltipComponent />
 *         </Portal>
 *
 *         <Portal>
 *           <NotificationComponent />
 *         </Portal>
 *
 *         // All portal content renders here
 *         <Portal.Anchor />
 *       </div>
 *     </PortalContextProvider>
 *   );
 * };
 * ```
 *
 * @param props - Standard React children props containing the component tree that may include Portal components
 * @returns The provider component that enables Portal functionality for its descendants
 */
export const PortalContextProvider = ({ children }: PropsWithChildren) => {
  const [elements, setElements] =
    useState<ReadonlyMap<string, ReactNode>>(EMPTY_ELEMENTS);

  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

  const value = useMemo(
    () => ({
      setPortalAnchor: setAnchor,
      register: (id: string, element: ReactNode) => {
        setElements((previous) => new Map(previous).set(id, element));
      },
      unregister: (id: string) => {
        setElements((previous) => {
          const next = new Map(previous);
          next.delete(id);
          return next;
        });
      },
    }),
    [],
  );

  return (
    <PortalContext.Provider value={value}>
      {children}
      {anchor &&
        createPortal(
          <Fragment>
            {Array.from(elements, ([id, element]) => (
              <Fragment key={id}>{element}</Fragment>
            ))}
          </Fragment>,
          anchor,
        )}
    </PortalContext.Provider>
  );
};

/** Shared empty registry so every provider starts from the same reference. */
const EMPTY_ELEMENTS: ReadonlyMap<string, ReactNode> = new Map();
