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
