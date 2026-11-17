import { useEffect, useRef } from 'react';

import { useMemorize } from '@winglet/react-utils/hook';

import type { BootstrapProviderProps } from '../type';

/** Component identities belong to the bootstrap lifetime, including deferred roots. */
type InitialComponents = Pick<
  BootstrapProviderProps,
  | 'ForegroundComponent'
  | 'BackgroundComponent'
  | 'TitleComponent'
  | 'SubtitleComponent'
  | 'ContentComponent'
  | 'FooterComponent'
>;

/**
 * Captures bootstrap component identities before any portal exists.
 * @param components - Current overrides; changing data belongs in context instead.
 * @returns Mount-time overrides; changes warn once per prop in development.
 */
export const useInitialComponents = (components: InitialComponents) => {
  const initial = useMemorize(() => components);
  const warned = useRef(new Set<keyof InitialComponents>());
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    for (const name of Object.keys(components) as Array<
      keyof InitialComponents
    >) {
      if (components[name] === initial[name] || warned.current.has(name))
        continue;
      warned.current.add(name);
      console.warn(
        `[promise-modal] ${name} is fixed at mount; pass changing data through context instead.`,
      );
    }
  }, [components, initial]);
  return initial;
};
