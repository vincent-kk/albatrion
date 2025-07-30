import { useCallback, useMemo } from 'react';

import { useOnMount } from '@winglet/react-utils/hook';

import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import { bootstrap } from './helpers/bootstrap';
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
 * @param props.mode - 'auto' for automatic initialization, 'manual' for explicit control
 * @returns Object containing portal element and initialize function
 *
 * @example
 * Basic usage with automatic initialization:
 * ```tsx
 * function App() {
 *   const { portal } = useBootstrap({
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
 *   const { portal, initialize } = useBootstrap({
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
 *   const { portal } = useBootstrap({
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
 * Multiple modal systems:
 * ```tsx
 * function MultiModalApp() {
 *   // System modals (errors, confirmations)
 *   const { portal: systemPortal } = useBootstrap({
 *     ForegroundComponent: SystemModal,
 *     options: { backdrop: 'rgba(255, 0, 0, 0.8)' },
 *   });
 *
 *   // Feature modals (forms, wizards)
 *   const { portal: featurePortal } = useBootstrap({
 *     ForegroundComponent: FeatureModal,
 *     options: { backdrop: 'rgba(0, 0, 255, 0.8)' },
 *   });
 *
 *   return (
 *     <>
 *       <SystemSection />
 *       <FeatureSection />
 *       {systemPortal}
 *       {featurePortal}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * With custom hooks for specific modal types:
 * ```tsx
 * function useConfirmDialog() {
 *   const { portal } = useBootstrap({
 *     TitleComponent: ({ children }) => (
 *       <h3 className="confirm-title">
 *         <Icon name="warning" />
 *         {children}
 *       </h3>
 *     ),
 *     FooterComponent: ({ onConfirm, onClose }) => (
 *       <div className="confirm-footer">
 *         <button onClick={onClose}>Cancel</button>
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
 * - Each hook instance creates an independent modal system
 * - Context changes will affect all modals created after the change
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
}: BootstrapProviderProps & { mode?: 'manual' | 'auto' } = {}) => {
  const usePathname = useMemo(
    () => useExternalPathname || useDefaultPathname,
    [useExternalPathname],
  );

  const { anchorRef, handleInitialize } = useInitialize();

  useOnMount(() => {
    if (mode === 'auto') handleInitialize();
    return () => {
      if (anchorRef.current) anchorRef.current.remove();
    };
  });

  const initialize = useCallback(
    (element: HTMLElement) => {
      if (mode === 'manual') handleInitialize(element);
    },
    [mode, handleInitialize],
  );

  const portal =
    anchorRef.current &&
    bootstrap({
      usePathname,
      ForegroundComponent,
      BackgroundComponent,
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
      options,
      context,
      anchor: anchorRef.current,
    });

  return { portal, initialize };
};
