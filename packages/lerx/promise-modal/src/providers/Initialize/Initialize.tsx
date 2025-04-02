import {
  Fragment,
  type PropsWithChildren,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

import { printError } from '@winglet/common-utils';
import { useOnMount, useTick } from '@winglet/react-utils';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { bootstrap } from '@/promise-modal/core/bootstrap';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import type { InitializeHandle, InitializeProps } from './type';

export const Initialize = forwardRef<
  InitializeHandle,
  PropsWithChildren<InitializeProps>
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
    }: PropsWithChildren<InitializeProps>,
    handleRef,
  ) => {
    const usePathname = useMemo(
      () => useExternalPathname || useDefaultPathname,
      [useExternalPathname],
    );
    const permitted = useRef(ModalManager.bootstrap());
    const anchorRef = useRef<HTMLElement | null>(null);
    const [, update] = useTick();

    const handelBootstrap = useCallback(
      (root?: HTMLElement) => {
        if (permitted.current) {
          anchorRef.current = ModalManager.anchor({ root });
          update();
        } else
          printError(
            'ModalProvider is already initialized',
            [
              'ModalProvider can only be initialized once.',
              'Nesting ModalProvider will be ignored...',
            ],
            {
              info: 'Something is wrong with the ModalProvider initialization...',
            },
          );
      },
      [update],
    );

    useImperativeHandle(
      handleRef,
      () => ({
        bootstrap: handelBootstrap,
      }),
      [handelBootstrap],
    );

    useOnMount(() => {
      if (handleRef) return;
      handelBootstrap();
      return () => {
        if (anchorRef.current) anchorRef.current.remove();
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
