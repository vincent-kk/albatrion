import { useRef } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app/ModalManager';

export const useInitialize = () => {
  const [, update] = useVersion();
  const anchorRef = useRef<HTMLElement | null>(null);
  const handleInitialize = useRef((root?: HTMLElement) => {
    if (ModalManager.anchored) return;
    anchorRef.current = ModalManager.anchor({ root });
    ModalManager.applyStyleSheet();
    update();
  });
  const handleReset = useRef(() => ModalManager.reset());

  return {
    anchorRef,
    handleInitialize: handleInitialize.current,
    handleReset: handleReset.current,
  } as const;
};
