import type { Fn } from '@aileron/declare';

import { ModalManager } from '@/promise-modal/app';
import type { ModalNode } from '@/promise-modal/core/node';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import type { Modal } from '@/promise-modal/types';

interface DispatchModalOptions<Result> {
  /** Abort signal that cancels the modal (before or after mount). */
  signal?: AbortSignal;
  /** Maps the node's raw resolve payload to the public promise result. */
  mapResult: Fn<[result: unknown], Result>;
  /** Raw payload used when the modal is aborted before React ever mounted. */
  cancelResult: Fn<[], unknown>;
}

/**
 * Opens a modal through ModalManager and wires its promise settlement.
 *
 * The resolver travels inside the modal data (`handleResolve`), so the wiring
 * survives the prerender queue: modals opened before the provider mounts are
 * flushed later and still settle the very same promise.
 *
 * @returns modalNode - live getter: undefined while the modal is queued before
 *   mount, then the node created by the flush (late reads see the real node)
 * @returns promiseHandler - settles on user interaction or abort; rejects only
 *   when the open handler itself throws
 */
export const dispatchModal = <Node extends ModalNode, Result>(
  modal: Modal,
  { signal, mapResult, cancelResult }: DispatchModalOptions<Result>,
) => {
  let modalNode: Node | undefined;
  // Cancels a still-queued (pre-mount) modal: drops it from the prerender queue
  // and settles the promise as cancelled. No-op once the modal has flushed.
  let cancel: Fn = () => {};
  const promiseHandler = new Promise<Result>((resolve, reject) => {
    let cleanupAbort: Fn | null = null;
    let settled = false;
    const settle = (result: unknown) => {
      if (settled) return;
      settled = true;
      cleanupAbort?.();
      cleanupAbort = null;
      resolve(mapResult(result));
    };
    modal.handleResolve = settle;
    cancel = () => {
      if (ModalManager.cancelPrerender(modal)) settle(cancelResult());
    };

    const wire = (node: Node) => {
      modalNode = node;
      if (signal === undefined) return;
      cleanupAbort?.();
      if (signal.aborted) {
        closeModal(node);
        return;
      }
      const handleAbort = () => closeModal(node);
      signal.addEventListener('abort', handleAbort, { once: true });
      cleanupAbort = () => signal.removeEventListener('abort', handleAbort);
    };

    try {
      if (signal?.aborted) {
        settle(cancelResult());
        return;
      }
      const node = ModalManager.open(modal) as Node | undefined;
      if (node) wire(node);
      else {
        if (signal) {
          const handleAbort = () => {
            ModalManager.cancelPrerender(modal);
            settle(cancelResult());
          };
          signal.addEventListener('abort', handleAbort, { once: true });
          cleanupAbort = () => signal.removeEventListener('abort', handleAbort);
        }
        ModalManager.bindPrerender(modal, () => {
          // Runs at flush time, outside the executor's try/catch: contain
          // failures here so one broken entry neither strands this promise
          // nor aborts the remaining queue flush.
          try {
            const flushed = ModalManager.open(modal) as Node | undefined;
            if (flushed) wire(flushed);
          } catch (error) {
            settled = true;
            cleanupAbort?.();
            cleanupAbort = null;
            reject(error);
          }
        });
      }
    } catch (error) {
      cleanupAbort?.();
      reject(error);
    }
  });
  return {
    get modalNode() {
      return modalNode;
    },
    promiseHandler,
    cancel,
  };
};
