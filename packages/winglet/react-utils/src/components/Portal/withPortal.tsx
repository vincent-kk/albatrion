import { type ComponentType, memo } from 'react';

import { PortalContextProvider } from './context/PortalContextProvider';

/**
 * Enhances components with Portal functionality by providing the necessary context infrastructure.
 *
 * This Higher-Order Component (HOC) wraps any React component with a PortalContextProvider,
 * enabling the use of Portal and Portal.Anchor components within the component tree. It creates
 * an isolated portal context that manages the registration, rendering, and lifecycle of all
 * portal content within the wrapped component and its descendants.
 *
 * ### Use Cases
 * - **Root Application Wrapper**: Enable portal functionality across your entire app
 * - **Feature Module Isolation**: Create portal contexts for specific features or pages
 * - **Component Library Integration**: Add portal capabilities to third-party components
 * - **Modal System Architecture**: Build reusable modal systems with proper context isolation
 *
 * ### Key Features
 * - Creates an isolated portal context scope for the wrapped component
 * - Manages multiple Portal instances with unique identification and lifecycle
 * - Provides automatic cleanup and memory management for portal content
 * - Maintains React component tree structure while enabling DOM location changes
 * - Memory-optimized with React.memo for performance
 *
 * ### Context Scope and Isolation
 * - Each withPortal wrapper creates its own independent portal context
 * - Portal components only work within their nearest withPortal ancestor
 * - Multiple withPortal instances can coexist without interference
 * - Context isolation prevents portal content from appearing in wrong locations
 *
 * @example
 * ```typescript
 * // Application-level portal setup
 * const App = Portal.with(() => {
 *   return (
 *     <div className="app">
 *       <Header />
 *       <Main />
 *       <Footer />
 *       // Global portal anchor for modals, tooltips, etc.
 *       <Portal.Anchor className="global-portal-root" />
 *     </div>
 *   );
 * });
 *
 * // Feature-specific portal context
 * const DashboardPage = Portal.with(() => {
 *   const [showSettings, setShowSettings] = useState(false);
 *
 *   return (
 *     <div className="dashboard">
 *       <Sidebar>
 *         <button onClick={() => setShowSettings(true)}>
 *           Settings
 *         </button>
 *
 *         {showSettings && (
 *           <Portal>
 *             <SettingsModal onClose={() => setShowSettings(false)} />
 *           </Portal>
 *         )}
 *       </Sidebar>
 *
 *       <MainContent />
 *
 *       // Dashboard-specific portal anchor
 *       <Portal.Anchor className="dashboard-modals" />
 *     </div>
 *   );
 * });
 *
 * // Nested portal contexts (each has its own scope)
 * const ComplexLayout = Portal.with(() => {
 *   return (
 *     <div className="layout">
 *       <Header>
 *         <Portal>
 *           <div className="header-notification">Header portal content</div>
 *         </Portal>
 *       </Header>
 *
 *       <Content>
 *         // Nested portal context for content area
 *         <ContentWithPortals />
 *       </Content>
 *
 *       <Portal.Anchor className="header-portals" />
 *     </div>
 *   );
 * });
 *
 * const ContentWithPortals = Portal.with(() => {
 *   return (
 *     <div>
 *       <Portal>
 *         <div className="content-overlay">Content portal content</div>
 *       </Portal>
 *
 *       <Portal.Anchor className="content-portals" />
 *     </div>
 *   );
 * });
 *
 * // Wrapping third-party components
 * import { SomeLibraryComponent } from 'some-library';
 * const LibraryWithPortals = Portal.with(SomeLibraryComponent);
 *
 * const Usage = () => (
 *   <LibraryWithPortals someProp="value">
 *     <Portal>
 *       <CustomOverlay />
 *     </Portal>
 *
 *     <Portal.Anchor />
 *   </LibraryWithPortals>
 * );
 * ```
 *
 * @typeParam Type - The type definition for the wrapped component's props
 * @param Component - The React component to enhance with Portal context functionality
 * @returns A memoized component that provides Portal context to its children and can use Portal/Portal.Anchor
 */
export const withPortal = <Type extends object>(
  Component: ComponentType<Type>,
) => {
  return memo((props: Type) => (
    <PortalContextProvider>
      <Component {...props} />
    </PortalContextProvider>
  ));
};
