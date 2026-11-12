import { useMemo } from 'react';

import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import { bootstrap } from './helpers/bootstrap';
import { useInitialComponents } from './hooks/useInitialComponents';
import { useInitialize } from './hooks/useInitialize';
import type { BootstrapProviderProps } from './type';

/**
 * Hook for bootstrapping the promise-modal system without a provider component.
 *
 * Provides the same functionality as BootstrapProvider but as a hook, allowing
 * more flexible integration patterns. Returns a portal element and an initialize
 * function for manual control.
 *
 * @param props - Configuration options (same as BootstrapProvider)
 * @param props.root - Undefined uses body; null defers or detaches without losing input
 * @param props.mode - 'auto' for automatic initialization, 'manual' for explicit control
 * @returns Object containing portal element and initialize function
 *
 * @example
 * Basic usage with automatic initialization:
 * ```tsx
 * function App() {
 *   const { portal } = useInitializeModal({
 *     options: {
 *       duration: 200,
 *       backdrop: 'rgba(0, 0, 0, 0.8)',
 *     },
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={() => alert({ title: 'Hello!' })}>Alert</button>
 *       <button onClick={() => confirm({ title: 'Confirm?' })}>Confirm</button>
 *       {portal}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * Manual initialization with custom container:
 * ```tsx
 * function CustomModalApp() {
 *   const { portal, initialize } = useInitializeModal({
 *     mode: 'manual',
 *     ForegroundComponent: CustomModal,
 *     options: {
 *       closeOnBackdropClick: false,
 *     },
 *   });
 *
 *   useEffect(() => {
 *     const container = document.getElementById('modal-root');
 *     if (container) {
 *       initialize(container);
 *     }
 *   }, [initialize]);
 *
 *   return (
 *     <div>
 *       <main>App Content</main>
 *       <div id="modal-root" />
 *       {portal}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Integration with state management:
 * ```tsx
 * function ConnectedApp() {
 *   const user = useSelector(selectCurrentUser);
 *   const theme = useSelector(selectTheme);
 *
 *   const { portal } = useInitializeModal({
 *     context: { userId: user?.id, theme },
 *     ContentComponent: ({ children, context }) => (
 *       <div data-theme={context.theme}>
 *         {children}
 *       </div>
 *     ),
 *   });
 *
 *   const handleDelete = async () => {
 *     const confirmed = await confirm({
 *       title: 'Delete Account',
 *       content: `Are you sure, ${user.name}?`,
 *     });
 *     if (confirmed) {
 *       dispatch(deleteAccount());
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete Account</button>
 *       {portal}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * With custom hooks for specific modal types:
 * ```tsx
 * function useConfirmDialog() {
 *   const { portal } = useInitializeModal({
 *     TitleComponent: ({ children }) => (
 *       <h3 className="confirm-title">
 *         <Icon name="warning" />
 *         {children}
 *       </h3>
 *     ),
 *     FooterComponent: ({ onConfirm, onCancel }) => (
 *       <div className="confirm-footer">
 *         <button onClick={onCancel}>Cancel</button>
 *         <button onClick={onConfirm} className="danger">
 *           Confirm
 *         </button>
 *       </div>
 *     ),
 *   });
 *
 *   const confirmAction = useCallback(
 *     (title: string, content: string) => {
 *       return confirm({ title, content });
 *     },
 *     [],
 *   );
 *
 *   return { portal, confirmAction };
 * }
 *
 * function App() {
 *   const { portal, confirmAction } = useConfirmDialog();
 *
 *   const handleDelete = async () => {
 *     const confirmed = await confirmAction(
 *       'Delete Item',
 *       'This action cannot be undone.',
 *     );
 *     if (confirmed) {
 *       // Perform deletion
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete</button>
 *       {portal}
 *     </>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Use `mode: 'manual'` when you need to control the initialization timing
 * - The portal element must be rendered in your component tree
 * - One bootstrap owns the portal; additional bootstraps wait for ownership
 * - Removing the last bootstrap cancels pending modals after the current commit
 * - Context changes update open modals; component props stay fixed at mount
 */
export const useBootstrap = ({
  usePathname: useExternalPathname,
  ForegroundComponent,
  BackgroundComponent,
  TitleComponent,
  SubtitleComponent,
  ContentComponent,
  FooterComponent,
  options,
  context,
  mode = 'auto',
  root,
}: BootstrapProviderProps & { mode?: 'manual' | 'auto' } = {}) => {
  const usePathname = useMemo(
    () => useExternalPathname || useDefaultPathname,
    [useExternalPathname],
  );

  const components = useInitialComponents({
    ForegroundComponent,
    BackgroundComponent,
    TitleComponent,
    SubtitleComponent,
    ContentComponent,
    FooterComponent,
  });

  const { anchorRef, handleInitialize: initialize } = useInitialize(root, mode);

  const portal =
    anchorRef.current &&
    bootstrap({
      ...components,
      usePathname,
      options,
      context,
      anchor: anchorRef.current,
    });

  return { portal, initialize };
};
