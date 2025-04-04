import { useCallback, useMemo } from 'react';

import { useOnMount } from '@winglet/react-utils';

import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';

import { bootstrap } from './helpers/bootstrap';
import { useInitialize } from './hooks/useInitialize';
import type { BootstrapProviderProps } from './type';

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
}: BootstrapProviderProps & { mode?: 'manual' | 'auto' } = {}) => {
  const usePathname = useMemo(
    () => useExternalPathname || useDefaultPathname,
    [useExternalPathname],
  );

  const { anchorRef, handleInitialize } = useInitialize();

  useOnMount(() => {
    if (mode === 'auto') handleInitialize();
    return () => {
      if (anchorRef.current) anchorRef.current.remove();
    };
  });

  const initialize = useCallback(
    (element: HTMLElement) => {
      if (mode === 'manual') handleInitialize(element);
    },
    [mode, handleInitialize],
  );

  const portal =
    anchorRef.current &&
    bootstrap({
      usePathname,
      ForegroundComponent,
      BackgroundComponent,
      TitleComponent,
      SubtitleComponent,
      ContentComponent,
      FooterComponent,
      options,
      context,
      anchor: anchorRef.current,
    });

  return { portal, initialize };
};
