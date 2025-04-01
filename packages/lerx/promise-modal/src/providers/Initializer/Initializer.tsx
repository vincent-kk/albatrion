import { Fragment, type PropsWithChildren, useRef } from 'react';

import { createPortal } from 'react-dom';

import { printError } from '@winglet/common-utils';
import { useOnMount, useTick } from '@winglet/react-utils';

import type { Dictionary } from '@aileron/types';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { Anchor } from '@/promise-modal/components/Anchor';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import {
  ConfigurationContextProvider,
  type ConfigurationContextProviderProps,
} from '../ConfigurationContext';
import { ModalManagerContextProvider } from '../ModalManagerContext';
import { UserDefinedContextProvider } from '../UserDefinedContext';

interface InitializerProps extends ConfigurationContextProviderProps {
  context?: Dictionary;
  usePathname?: () => { pathname: string };
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
  children,
}: PropsWithChildren<InitializerProps>) => {
  const { pathname } = (usePathname || useDefaultPathname)();
  const [, update] = useTick();
  const portalRef = useRef<HTMLElement>(
    ModalManager.unanchored ? ModalManager.anchor() : null,
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
        createPortal(
          <UserDefinedContextProvider context={context}>
            <ConfigurationContextProvider
              ForegroundComponent={ForegroundComponent}
              BackgroundComponent={BackgroundComponent}
              TitleComponent={TitleComponent}
              SubtitleComponent={SubtitleComponent}
              ContentComponent={ContentComponent}
              FooterComponent={FooterComponent}
              options={options}
            >
              <ModalManagerContextProvider pathname={pathname}>
                <Anchor />
              </ModalManagerContextProvider>
            </ConfigurationContextProvider>
          </UserDefinedContextProvider>,
          portalRef.current,
        )}
    </Fragment>
  );
};
