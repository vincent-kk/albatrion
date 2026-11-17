import { useMemo } from 'react';

import { usePathname as useDefaultPathname } from '@/promise-modal/app';

import { bootstrap } from './helpers/bootstrap';
import { useInitialComponents } from './hooks/useInitialComponents';
import { useInitialize } from './hooks/useInitialize';
import type { BootstrapProviderProps } from './type';

/**
 * Initializes the modal system when the caller renders the returned portal.
 * @param props - Provider configuration plus auto/manual mode. Manual mode defers the initial root.
 * @returns A portal to render and initialize(element), which selects the effective root.
 * @remarks
 * An omitted root uses body; null detaches and queues new requests while preserving mounted modals.
 * The last root prop change or initialize call wins. Component props stay fixed at mount;
 * pass changing data through context. Additional bootstraps wait for the portal owner.
 * @example
 * ```tsx
 * import { useEffect, useRef } from 'react';
 * import { confirm, useInitializeModal } from '@lerx/promise-modal';
 *
 * function App() {
 *   const root = useRef<HTMLDivElement>(null);
 *   const { portal, initialize } = useInitializeModal({
 *     mode: 'manual',
 *     FooterComponent: ({ onConfirm, onCancel }) => <footer>
 *       {onCancel && <button onClick={onCancel}>Cancel</button>}
 *       <button onClick={onConfirm}>Confirm</button>
 *     </footer>,
 *   });
 *   useEffect(() => { if (root.current) initialize(root.current); }, [initialize]);
 *   return <>
 *     <div ref={root} />
 *     <button onClick={() => void confirm({ title: 'Continue?' })}>Open</button>
 *     {portal}
 *   </>;
 * }
 * ```
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
