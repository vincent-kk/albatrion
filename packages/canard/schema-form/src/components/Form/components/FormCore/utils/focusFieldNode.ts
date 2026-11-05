import type { Nullable } from '@aileron/declare';

import { type FieldNode, FieldNodeRequestType } from '@/schema-form/core';
import {
  FieldLifecycle,
  FieldLifecycleAction,
  type FieldLifecycleRegistry,
} from '@/schema-form/helpers/fieldLifecycle';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import type { FocusRequest } from './FocusRequest';
import { isInputMounted } from './isInputMounted';

/**
 * Focus the exact target through a cancellable Mount reservation when a gate blocks it.
 * @param target - Current field; absent or non-present targets are ignored.
 * @param form - Owning form whose document observes focus movement during reveal.
 * @param manager - Form-local virtualization coordinator, null for eager rendering.
 * @param lifecycle - Form-local action queues, null outside the lifecycle provider.
 * @param request - Already-owned request so synchronous reveal reentry can cancel it.
 */
export const focusFieldNode = (
  target: Nullable<FieldNode> | undefined,
  form: Nullable<HTMLFormElement>,
  manager: Nullable<VirtualizationManager>,
  lifecycle: Nullable<FieldLifecycleRegistry>,
  request: FocusRequest,
): void => {
  if (!target || !target.isPresent) return;
  if (!manager || !lifecycle || !form || isInputMounted(manager, target)) {
    target.request(FieldNodeRequestType.Focus);
    return;
  }
  const document = form.ownerDocument;
  let moved = false;
  const onFocus = () => {
    moved = true;
    document.removeEventListener('focusin', onFocus, true);
  };
  document.addEventListener('focusin', onFocus, true);
  request.onCancel(() =>
    document.removeEventListener('focusin', onFocus, true),
  );
  request.onCancel(
    lifecycle.reserve(target, FieldLifecycle.Mount, () =>
      request.live && !moved
        ? FieldLifecycleAction.Focus
        : FieldLifecycleAction.None,
    ),
  );
  if (!manager.revealPath(target, () => request.cancel())) {
    request.cancel();
    target.request(FieldNodeRequestType.Focus);
  }
};
