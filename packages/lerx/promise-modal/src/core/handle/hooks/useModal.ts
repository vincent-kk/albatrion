import { useRef } from 'react';

import { useOnUnmount } from '@winglet/react-utils/hook';

import type { ModalNode } from '@/promise-modal/core/node';
import { closeModal } from '@/promise-modal/core/node';
import { mergeDefined } from '@/promise-modal/helpers/mergeDefined';

import type {
  AlertProps,
  ConfirmProps,
  OverridableHandleProps,
  PromptProps,
} from '../types/type';
import { alertHandler } from '../utils/alert';
import { confirmHandler } from '../utils/confirm';
import { promptHandler } from '../utils/prompt';

/**
 * Opens component-owned modals and releases completed request handles immediately.
 * @param configuration - Mount-time defaults; each call can override them.
 * @returns Stable alert, confirm and prompt functions; unmount cancels pending requests.
 */
export const useModal = (configuration?: OverridableHandleProps) => {
  // Handler results expose modalNode as a live getter, so modals queued
  // before the provider mounted are still reachable at cleanup time.
  const modalResultsRef = useRef<
    Array<{
      readonly modalNode: ModalNode | undefined;
      readonly cancel: () => void;
    }>
  >([]);
  const baseArgsRef = useRef(configuration);

  const alertRef = useRef(<Background = any>(args: AlertProps<Background>) => {
    const result = alertHandler<Background>(
      mergeDefined(baseArgsRef.current ?? {}, args),
    );
    modalResultsRef.current.push(result);
    const remove = () => {
      const index = modalResultsRef.current.indexOf(result);
      if (index >= 0) modalResultsRef.current.splice(index, 1);
    };
    result.promiseHandler.then(remove, remove);
    return result.promiseHandler;
  });

  const confirmRef = useRef(
    <Background = any>(args: ConfirmProps<Background>) => {
      const result = confirmHandler<Background>(
        mergeDefined(baseArgsRef.current ?? {}, args),
      );
      modalResultsRef.current.push(result);
      const remove = () => {
        const index = modalResultsRef.current.indexOf(result);
        if (index >= 0) modalResultsRef.current.splice(index, 1);
      };
      result.promiseHandler.then(remove, remove);
      return result.promiseHandler;
    },
  );

  const promptRef = useRef(
    <Value, Background = any>(args: PromptProps<Value, Background>) => {
      const result = promptHandler<Value, Background>(
        mergeDefined(baseArgsRef.current ?? {}, args),
      );
      modalResultsRef.current.push(result);
      const remove = () => {
        const index = modalResultsRef.current.indexOf(result);
        if (index >= 0) modalResultsRef.current.splice(index, 1);
      };
      result.promiseHandler.then(remove, remove);
      return result.promiseHandler;
    },
  );

  useOnUnmount(() => {
    for (const result of modalResultsRef.current) {
      const modalNode = result.modalNode;
      if (modalNode) closeModal(modalNode);
      // Still queued before the provider mounted: cancel the prerender entry so
      // it does not orphan a queued modal and a forever-pending promise.
      else result.cancel();
    }
    modalResultsRef.current = [];
  });

  return {
    alert: alertRef.current,
    confirm: confirmRef.current,
    prompt: promptRef.current,
  } as const;
};
