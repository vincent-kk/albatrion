import { createPortal } from 'react-dom';

import type { Dictionary } from '@aileron/types';

import { Anchor } from '@/promise-modal/components/Anchor';

import {
  ConfigurationContextProvider,
  type ConfigurationContextProviderProps,
} from '../ConfigurationContext';
import { ModalManagerContextProvider } from '../ModalManagerContext';
import { UserDefinedContextProvider } from '../UserDefinedContext';

interface InitializeModalProps extends ConfigurationContextProviderProps {
  context?: Dictionary;
  pathname?: string;
  root: HTMLElement;
}

export const initializeModal = ({
  ForegroundComponent,
  BackgroundComponent,
  TitleComponent,
  SubtitleComponent,
  ContentComponent,
  FooterComponent,
  options,
  context,
  pathname,
  root,
}: InitializeModalProps) =>
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
    root,
  );
