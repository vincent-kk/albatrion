import { useInsertionEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

import { ModalManager } from '@/promise-modal/app';
import type { ModalNode } from '@/promise-modal/core/node';
import { closeModal } from '@/promise-modal/core/node';
import { mergeDefined } from '@/promise-modal/helpers/mergeDefined';
import { useIsomorphicLayoutEffect } from '@/promise-modal/hooks/useIsomorphicLayoutEffect';

import type {
  AlertProps,
  ConfirmProps,
  OverridableHandleProps,
  PromptProps,
} from '../types/type';
import { alertHandler } from '../utils/alert';
import { confirmHandler } from '../utils/confirm';
import { promptHandler } from '../utils/prompt';

/** A queued request may gain a modal node after the caller has registered it. */
type PendingRequest = {
  readonly modalNode: ModalNode | undefined;
  readonly cancel: Fn;
};

/**
 * Retains one request until either outcome settles its promise.
 * @param request Live request handle returned by dispatch.
 * @param pending Requests registered by the current caller.
 * @returns The request's original promise.
 */
function trackRequest<Result>(
  request: PendingRequest & { readonly promiseHandler: Promise<Result> },
  pending: PendingRequest[],
): Promise<Result> {
  pending.push(request);
  const remove = () => {
    const index = pending.indexOf(request);
    if (index >= 0) pending.splice(index, 1);
  };
  request.promiseHandler.then(remove, remove);
  return request.promiseHandler;
}

/**
 * Cancels an owned request through its live node or its prerender handle.
 * @param pending Requests relinquished by the caller.
 */
function cancelRequests(pending: readonly PendingRequest[]): void {
  for (const request of pending) {
    if (request.modalNode) closeModal(request.modalNode);
    else request.cancel();
  }
}

/**
 * Opens component-owned modals and releases completed request handles immediately.
 * @param configuration - Mount-time defaults; each call can override them.
 * @returns Stable alert, confirm and prompt functions; unmount cancels pending requests.
 */
export const useModal = (configuration?: OverridableHandleProps) => {
  const modalResultsRef = useRef<PendingRequest[]>([]);
  const baseArgsRef = useRef(configuration);

  const alertRef = useRef(<Background = any>(args: AlertProps<Background>) =>
    trackRequest(
      alertHandler<Background>(mergeDefined(baseArgsRef.current ?? {}, args)),
      modalResultsRef.current,
    ),
  );

  const confirmRef = useRef(
    <Background = any>(args: ConfirmProps<Background>) =>
      trackRequest(
        confirmHandler<Background>(mergeDefined(baseArgsRef.current ?? {}, args)),
        modalResultsRef.current,
      ),
  );

  const promptRef = useRef(
    <Value, Background = any>(args: PromptProps<Value, Background>) =>
      trackRequest(
        promptHandler<Value, Background>(mergeDefined(baseArgsRef.current ?? {}, args)),
        modalResultsRef.current,
      ),
  );

  // Insertion effects span hiding and run this cleanup at actual removal.
  useInsertionEffect(
    () => () => {
      const results = modalResultsRef.current;
      if (!results.length) return;
      modalResultsRef.current = [];
      queueMicrotask(() => cancelRequests(results));
    },
    [],
  );

  useIsomorphicLayoutEffect(
    () => () => {
      const results = modalResultsRef.current;
      if (!results.length) return;
      queueMicrotask(() => {
        // When both lifetimes hide together, the Provider has released its anchor.
        if (
          modalResultsRef.current !== results ||
          ModalManager.anchored ||
          !results.some((request) => request.modalNode)
        )
          return;
        modalResultsRef.current = [];
        cancelRequests(results);
      });
    },
    [],
  );

  return {
    alert: alertRef.current,
    confirm: confirmRef.current,
    prompt: promptRef.current,
  } as const;
};
