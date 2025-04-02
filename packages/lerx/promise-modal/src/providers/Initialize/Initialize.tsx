import { Fragment, type PropsWithChildren, useRef } from 'react';

import { printError } from '@winglet/common-utils';
import { useHandle, useOnMount } from '@winglet/react-utils';

import type { Dictionary, Fn } from '@aileron/types';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { bootstrap } from '@/promise-modal/core/bootstrap';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import type { ConfigurationContextProviderProps } from '../ConfigurationContext';

interface InitializerProps extends ConfigurationContextProviderProps {
  usePathname?: Fn<[], { pathname: string }>;
  context?: Dictionary;
  root?: HTMLElement;
}

export const Initialize = ({
  usePathname: useExternalPathname,
  ForegroundComponent,
  BackgroundComponent,
  TitleComponent,
  SubtitleComponent,
  ContentComponent,
  FooterComponent,
  options,
  context,
  root,
  children,
}: PropsWithChildren<InitializerProps>) => {
  const usePathname = useHandle(useExternalPathname || useDefaultPathname);
  const portalRef = useRef<HTMLElement>(
    ModalManager.unanchored ? ModalManager.anchor({ root }) : null,
  );

  useOnMount(() => {
    if (!portalRef.current)
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
    return () => {
      if (portalRef.current) {
        portalRef.current.remove();
      }
    };
  });

  return (
    <Fragment>
      {children}
      {portalRef.current &&
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
          anchor: portalRef.current,
        })}
    </Fragment>
  );
};
