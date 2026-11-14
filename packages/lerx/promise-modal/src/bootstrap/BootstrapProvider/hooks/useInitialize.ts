import { useRef } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import type { Fn } from '@aileron/declare';

import { ModalManager } from '@/promise-modal/app';
import { useIsomorphicLayoutEffect } from '@/promise-modal/hooks/useIsomorphicLayoutEffect';

/**
 * Connects a bootstrap to its last declared or imperative root.
 * @param root - Undefined selects body, null defers, and an element selects a container.
 * @param mode - Manual mode defers the initial root until initialize or a prop change.
 * @returns A stable element initializer and the owned portal anchor.
 */
export const useInitialize = (
  root?: HTMLElement | null,
  mode: 'auto' | 'manual' = 'auto',
) => {
  const [, update] = useVersion();
  const identity = useRef({});
  const anchorRef = useRef<HTMLElement | null>(null);
  const effectiveRoot = useRef(mode === 'manual' ? null : root);
  const previousRoot = useRef(root);
  const handleInitialize = useRef(
    (element: HTMLElement | null = document.body) => {
      effectiveRoot.current = element;
      ModalManager.attach(identity.current, element, (anchor) => {
        if (anchorRef.current === anchor) return;
        anchorRef.current = anchor;
        update();
      });
    },
  );
  const handleReset = useRef(() => ModalManager.detach(identity.current));
  useIsomorphicLayoutEffect(() => {
    if (previousRoot.current !== root) effectiveRoot.current = root;
    previousRoot.current = root;
    handleInitialize.current(
      effectiveRoot.current === undefined
        ? document.body
        : effectiveRoot.current,
    );
  }, [root]);
  useIsomorphicLayoutEffect(() => handleReset.current, []);
  const initialize: Fn<[element: HTMLElement]> = handleInitialize.current;
  return {
    anchorRef,
    handleInitialize: initialize,
  } as const;
};
