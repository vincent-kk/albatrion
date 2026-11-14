import {
  Fragment,
  type PropsWithChildren,
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
} from 'react';

import { usePathname as useDefaultPathname } from '@/promise-modal/app';

import { bootstrap } from './helpers/bootstrap';
import { useInitialComponents } from './hooks/useInitialComponents';
import { useInitialize } from './hooks/useInitialize';
import type { BootstrapProviderHandle, BootstrapProviderProps } from './type';

/**
 * Initializes the shared modal system and renders the owning portal.
 * @param props - Components fixed at mount, reactive context/options, and optional root.
 * @returns Application children and the portal while this bootstrap owns it.
 * @remarks
 * An omitted root uses body; null defers or detaches without losing mounted input.
 * A ref alone does not defer initialization. The last root change or initialize call wins.
 * Extra bootstraps wait; the first waiter takes over when the owner unmounts.
 * Without a waiter, open requests cancel after the current commit; same-commit remounts preserve them.
 * Call modal functions only in the browser; server rendering creates no portal.
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import { ModalProvider, alert } from '@lerx/promise-modal';
 *
 * function App() {
 *   const [root, setRoot] = useState<HTMLDivElement | null>(null);
 *   return <ModalProvider root={root}>
 *     <div ref={setRoot} />
 *     <button onClick={() => void alert({ title: 'Hello' })}>Open</button>
 *   </ModalProvider>;
 * }
 * ```
 */
export const BootstrapProvider = memo(
  forwardRef<
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
        root,
        context,
        children,
      },
      handleRef,
    ) => {
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

      const { anchorRef, handleInitialize } = useInitialize(root);

      useImperativeHandle(
        handleRef,
        () => ({
          initialize: handleInitialize,
        }),
        [handleInitialize],
      );

      return (
        <Fragment>
          {children}
          {anchorRef.current &&
            bootstrap({
              ...components,
              usePathname,
              options,
              context,
              anchor: anchorRef.current,
            })}
        </Fragment>
      );
    },
  ),
);
