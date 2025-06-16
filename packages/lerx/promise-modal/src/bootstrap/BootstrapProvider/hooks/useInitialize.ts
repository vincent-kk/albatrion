import { useCallback, useRef } from 'react';

import { printError } from '@winglet/common-utils/console';
import { useVersion } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app/ModalManager';

export const useInitialize = () => {
  const permitted = useRef(ModalManager.activate());
  const anchorRef = useRef<HTMLElement | null>(null);
  const [, update] = useVersion();

  const handleInitialize = useCallback(
    (root?: HTMLElement) => {
      if (permitted.current) {
        anchorRef.current = ModalManager.anchor({ root });
        ModalManager.applyStyleSheet();
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

  const handleReset = useCallback(() => {
    ModalManager.reset();
  }, []);

  return {
    anchorRef,
    handleInitialize,
    handleReset,
  } as const;
};
