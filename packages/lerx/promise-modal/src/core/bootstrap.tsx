import { createPortal } from 'react-dom';

import type { Dictionary } from '@aileron/types';

import { Anchor } from '@/promise-modal/components/Anchor';
import {
  ConfigurationContextProvider,
  type ConfigurationContextProviderProps,
} from '@/promise-modal/providers/ConfigurationContext';
import { ModalManagerContextProvider } from '@/promise-modal/providers/ModalManagerContext';
import { UserDefinedContextProvider } from '@/promise-modal/providers/UserDefinedContext';

interface InitializeModalProps extends ConfigurationContextProviderProps {
  context?: Dictionary;
  pathname?: string;
  anchor: HTMLElement;
}

export const bootstrap = ({
  ForegroundComponent,
  BackgroundComponent,
  TitleComponent,
  SubtitleComponent,
  ContentComponent,
  FooterComponent,
  options,
  context,
  pathname,
  anchor,
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
    anchor,
  );
