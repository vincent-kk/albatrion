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
  const lifetime = useRef<{ generation: number; observer?: MutationObserver }>({ generation: 0 });
  const anchorRef = useRef<HTMLElement | null>(null);
  const effectiveRoot = useRef(mode === 'manual' ? null : root);
  const previousRoot = useRef(root);
  const handleInitialize = useRef(
    (element: HTMLElement | null = document.body) => {
      lifetime.current.generation++;
      lifetime.current.observer?.disconnect();
      lifetime.current.observer = undefined;
      effectiveRoot.current = element;
      ModalManager.attach(identity.current, element, (anchor) => {
        if (anchorRef.current === anchor) return;
        anchorRef.current = anchor;
        update();
      });
    },
  );
  const handleReset = useRef(() => {
    const anchor = anchorRef.current;
    const marker = anchor?.firstElementChild;
    const generation = ++lifetime.current.generation;
    ModalManager.suspend(identity.current);
    queueMicrotask(() => {
      if (generation !== lifetime.current.generation) return;
      if (!anchor || !marker || marker.parentNode !== anchor) {
        ModalManager.detach(identity.current);
        return;
      }
      const observer = new MutationObserver(() => {
        if (marker.parentNode === anchor) return;
        observer.disconnect();
        lifetime.current.observer = undefined;
        ModalManager.detach(identity.current);
      });
      observer.observe(anchor, { childList: true });
      lifetime.current.observer = observer;
    });
  });
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
