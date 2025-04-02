import { Fragment, type PropsWithChildren, useRef } from 'react';

import { printError } from '@winglet/common-utils';
import { useOnMount, useTick } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/types';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import type { ConfigurationContextProviderProps } from '../ConfigurationContext';
import { initializeModal } from './initializeModal';

interface InitializerProps extends ConfigurationContextProviderProps {
  context?: Dictionary;
  usePathname?: () => { pathname: string };
  root?: HTMLElement;
}

export const Initializer = ({
  ForegroundComponent,
  BackgroundComponent,
  TitleComponent,
  SubtitleComponent,
  ContentComponent,
  FooterComponent,
  options,
  context,
  usePathname,
  root,
  children,
}: PropsWithChildren<InitializerProps>) => {
  const { pathname } = (usePathname || useDefaultPathname)();
  const [, update] = useTick();
  const portalRef = useRef<HTMLElement>(
    ModalManager.unanchored ? ModalManager.anchor({ root }) : null,
  );

  useOnMount(() => {
    if (portalRef.current) update();
    else
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
        initializeModal({
          ForegroundComponent,
          BackgroundComponent,
          TitleComponent,
          SubtitleComponent,
          ContentComponent,
          FooterComponent,
          options,
          context,
          pathname,
          root: portalRef.current,
        })}
    </Fragment>
  );
};
