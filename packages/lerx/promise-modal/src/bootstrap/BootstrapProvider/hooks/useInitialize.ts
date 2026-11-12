import { useRef } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app';

/** Tracks this bootstrap's ownership; manager callbacks choose its portal anchor. */
export const useInitialize = () => {
  const [, update] = useVersion();
  const identity = useRef({});
  const anchorRef = useRef<HTMLElement | null>(null);
  const handleInitialize = useRef((root: HTMLElement = document.body) => {
    ModalManager.attach(identity.current, root, (anchor) => {
      anchorRef.current = anchor;
      update();
    });
  });
  const handleReset = useRef(() => ModalManager.detach(identity.current));
  return {
    anchorRef,
    handleInitialize: handleInitialize.current,
    handleReset: handleReset.current,
  } as const;
};
