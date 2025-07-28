import {
  Fragment,
  type PropsWithChildren,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';

import { map } from '@winglet/common-utils/array';
import { getRandomString } from '@winglet/common-utils/lib';

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
  const [components, setComponents] = useState<
    { id: string; element: ReactNode }[]
  >([]);

  const portalAnchorRef = useRef<HTMLDivElement>(null);

  const value = useMemo(
    () => ({
      portalAnchorRef,
      register: (element: ReactNode): string => {
        const id = getRandomString(36);
        setComponents((previous) => [...previous, { id, element }]);
        return id;
      },
      unregister: (id: string) => {
        setComponents((previous) =>
          previous.filter((component) => component.id !== id),
        );
      },
    }),
    [],
  );

  return (
    <PortalContext.Provider value={value}>
      {children}
      {portalAnchorRef.current &&
        createPortal(
          <Fragment>
            {map(components, ({ id, element }) => (
              <Fragment key={id}>{element}</Fragment>
            ))}
          </Fragment>,
          portalAnchorRef.current,
        )}
    </PortalContext.Provider>
  );
};
