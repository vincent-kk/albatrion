import type { Nullable } from '@aileron/declare';

import { type FieldNode, FieldNodeRequestType } from '@/schema-form/core';
import {
  FieldLifecycle,
  FieldLifecycleAction,
} from '@/schema-form/helpers/fieldLifecycle';
import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';
import type { InputPositions } from '@/schema-form/helpers/focusTarget';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import type { FocusRequest } from './FocusRequest';
import { isInputMounted } from './isInputMounted';

/**
 * Focus the exact target through a cancellable Mount reservation when a gate blocks it.
 * @param target - Current field; absent or non-present targets are ignored.
 * @param form - Owning form whose document observes focus movement during reveal.
 * @param manager - Form-local virtualization coordinator, null for eager rendering.
 * @param lifecycle - Form-local action queues, null outside the lifecycle provider.
 * @param inputPositions - Actual input positions owned by this form.
 * @param request - Already-owned request so synchronous reveal reentry can cancel it.
 * @returns Nothing; cancellation releases the reservation and document observers.
 */
export const focusFieldNode = (
  target: Nullable<FieldNode> | undefined,
  form: Nullable<HTMLFormElement>,
  manager: Nullable<VirtualizationManager>,
  lifecycle: Nullable<FieldLifecycleRegistry>,
  inputPositions: InputPositions,
  request: FocusRequest,
): void => {
  if (!target || !target.isPresent) return;
  if (
    !manager ||
    !lifecycle ||
    !form ||
    isInputMounted(inputPositions, target)
  ) {
    target.request(FieldNodeRequestType.Focus);
    return;
  }
  const document = form.ownerDocument;
  const focused = document.activeElement;
  let moved = false;
  let mountHandled = false;
  const onFocus = () => {
    moved = true;
  };
  const onFocusOut = (event: FocusEvent) => {
    if (event.target === focused && focused?.isConnected) moved = true;
  };
  const hasMoved = () =>
    moved || (!!focused?.isConnected && document.activeElement !== focused);
  document.addEventListener('focusin', onFocus, true);
  document.addEventListener('focusout', onFocusOut, true);
  request.onCancel(() => {
    document.removeEventListener('focusin', onFocus, true);
    document.removeEventListener('focusout', onFocusOut, true);
  });
  request.onCancel(
    lifecycle.reserve(target, FieldLifecycle.Mount, () => {
      mountHandled = true;
      return request.isLive && !hasMoved()
        ? FieldLifecycleAction.Focus
        : FieldLifecycleAction.None;
    }),
  );
  if (!manager.revealPath(target, () => request.cancel())) {
    queueMicrotask(() => {
      const shouldFocus = request.isLive && !mountHandled && !hasMoved();
      request.cancel();
      if (shouldFocus) target.request(FieldNodeRequestType.Focus);
    });
  }
};
