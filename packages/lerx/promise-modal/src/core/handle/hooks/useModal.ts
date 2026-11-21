import { useInsertionEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

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

  // React keeps insertion effects connected while hiding an Activity or Suspense tree.
  useInsertionEffect(
    () => () => {
      const results = modalResultsRef.current;
      if (!results.length) return;
      modalResultsRef.current = [];
      queueMicrotask(() => {
        for (const result of results) {
          const modalNode = result.modalNode;
          if (modalNode) closeModal(modalNode);
          else result.cancel();
        }
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
