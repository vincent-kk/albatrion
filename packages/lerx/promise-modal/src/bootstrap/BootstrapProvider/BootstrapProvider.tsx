import {
  Fragment,
  type PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';

import { useOnMount } from '@winglet/react-utils/hook';

import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import { bootstrap } from './helpers/bootstrap';
import { useInitialize } from './hooks/useInitialize';
import type { BootstrapProviderHandle, BootstrapProviderProps } from './type';

/**
 * Provider component that bootstraps the promise-modal system.
 *
 * Sets up the modal rendering infrastructure by creating a portal anchor point
 * and managing the lifecycle of modal components. Can be initialized automatically
 * on mount or manually via ref handle.
 *
 * @example
 * Basic usage with automatic initialization:
 * ```tsx
 * import { ModalProvider, alert, confirm } from '@lerx/promise-modal';
 *
 * function App() {
 *   return (
 *     <ModalProvider>
 *       <button onClick={() => alert({ title: 'Hello!' })}>Alert</button>
 *       <button onClick={() => confirm({ title: 'Confirm?' })}>Confirm</button>
 *     </ModalProvider>
 *   );
 * }
 * ```
 *
 * @example
 * Custom modal components:
 * ```tsx
 * const CustomForeground = ({ children, visible }) => (
 *   <div className={`modal ${visible ? 'show' : 'hide'}`}>
 *     {children}
 *   </div>
 * );
 *
 * const CustomTitle = ({ children }) => (
 *   <h2 className="modal-title">{children}</h2>
 * );
 *
 * <ModalProvider
 *   ForegroundComponent={CustomForeground}
 *   TitleComponent={CustomTitle}
 *   options={{
 *     duration: 300,
 *     backdrop: 'rgba(0, 0, 0, 0.5)',
 *     closeOnBackdropClick: false,
 *   }}
 * >
 *   <App />
 * </ModalProvider>
 * ```
 *
 * @example
 * Manual initialization with custom anchor:
 * ```tsx
 * function CustomModalContainer() {
 *   const modalRef = useRef<ModalProviderHandle>(null);
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   useEffect(() => {
 *     if (containerRef.current) {
 *       modalRef.current?.initialize(containerRef.current);
 *     }
 *   }, []);
 *
 *   return (
 *     <ModalProvider ref={modalRef}>
 *       <div className="app-layout">
 *         <main>Main Content</main>
 *         <div ref={containerRef} className="modal-container" />
 *       </div>
 *     </ModalProvider>
 *   );
 * }
 * ```
 *
 * @example
 * With routing integration:
 * ```tsx
 * import { useLocation } from 'react-router-dom';
 *
 * function useRouterPathname() {
 *   const location = useLocation();
 *   return { pathname: location.pathname };
 * }
 *
 * <ModalProvider usePathname={useRouterPathname}>
 *   <RouterApp />
 * </ModalProvider>
 * ```
 *
 * @example
 * Sharing context with modals:
 * ```tsx
 * const ThemeContext = createContext({ theme: 'light' });
 *
 * function ThemedModal() {
 *   const { theme } = useContext(ThemeContext);
 *   return <div className={`modal-${theme}`}>...</div>;
 * }
 *
 * <ModalProvider
 *   context={{ userId: currentUser.id }}
 *   ContentComponent={({ children, context }) => (
 *     <ThemeContext.Provider value={{ theme: context.theme }}>
 *       {children}
 *     </ThemeContext.Provider>
 *   )}
 * >
 *   <App />
 * </ModalProvider>
 * ```
 *
 * @remarks
 * - Without a ref, the provider initializes automatically on mount
 * - With a ref, you must call `initialize()` manually with target element
 * - All modals created within this provider share the same configuration
 * - The provider creates a portal for rendering modals outside the React tree
 */
export const BootstrapProvider = forwardRef<
  BootstrapProviderHandle,
  PropsWithChildren<BootstrapProviderProps>
>(
  (
    {
      usePathname: useExternalPathname,
      ForegroundComponent,
      BackgroundComponent,
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
      options,
      context,
      children,
    },
    handleRef,
  ) => {
    const usePathname = useMemo(
      () => useExternalPathname || useDefaultPathname,
      [useExternalPathname],
    );

    const { anchorRef, handleInitialize, handleReset } = useInitialize();

    useImperativeHandle(
      handleRef,
      () => ({
        initialize: handleInitialize,
      }),
      [handleInitialize],
    );

    useOnMount(() => {
      /**
       * NOTE: `handleRef` being null indicates that no `ref` was provided.
       *   In this case, the `ModalProvider`(=`BootstrapProvider`) is not receiving the `ref`,
       *   so it should be initialized automatically.
       */
      if (handleRef === null) handleInitialize();
      return () => {
        if (anchorRef.current) anchorRef.current.remove();
        handleReset();
      };
    });

    return (
      <Fragment>
        {children}
        {anchorRef.current &&
          bootstrap({
            ForegroundComponent,
            BackgroundComponent,
            TitleComponent,
            SubtitleComponent,
            ContentComponent,
            FooterComponent,
            usePathname,
            options,
            context,
            anchor: anchorRef.current,
          })}
      </Fragment>
    );
  },
);
