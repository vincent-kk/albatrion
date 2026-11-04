import { type ReactNode, useMemo, useSyncExternalStore } from 'react';

import { map as mapArray } from '@winglet/common-utils/array';
import { isTruthy } from '@winglet/common-utils/filter';

import { type FieldNode, type ValidationIssue } from '@/schema-form/core';
import {
  useFieldRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useErrorVisibility } from '@/schema-form/providers/FieldRendererContext';

import { createChildErrorStore } from './utils/createChildErrorStore';

/**
 * Read child issues and visibility using parent/child revision subscriptions.
 * @param node - Container whose current direct children supply the error matrix
 * @param disabled - Suppress error reads and event subscriptions when true
 * @returns Current raw errors, formatted messages and existing visibility decisions
 * Subscribed snapshots reuse one revision base and notification version; cold reads join current revisions.
 */
export const useChildFieldErrors = (
  node: FieldNode,
  disabled?: boolean,
): {
  errorMessage: ReactNode;
  showError: boolean;
  formattedError: ReactNode;
  showErrors: boolean[];
  formattedErrors: ReactNode[];
  errorMatrix: (readonly ValidationIssue[])[];
} => {
  const { formatError, checkShowError } = useFieldRendererContext();
  const { context } = useWorkspaceContext();
  const children = node.children;
  const store = useMemo(
    () => createChildErrorStore(node, children, disabled),
    [node, children, disabled],
  );
  const revision = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  const visibilityNodes = [node, ...(children ?? [])];
  const visible = useErrorVisibility(
    visibilityNodes,
    visibilityNodes.map((child) => !disabled && checkShowError(child.state)),
  );
  const visibility = visible.join(':');

  return useMemo(() => {
    const current = node.children ?? [];
    const errorMatrix = mapArray(current, (child) =>
      disabled ? [] : child.errors,
    );
    const formattedErrors = mapArray(errorMatrix, (errors, index) =>
      errors.length ? formatError(errors[0], current[index], context) : null,
    );
    const showErrors = visible.slice(1);
    const formattedError =
      formattedErrors.find((message) => message != null) ?? null;
    const showError = visible.some(isTruthy);

    return {
      errorMessage: showError ? formattedError : null,
      showError,
      formattedError,
      showErrors,
      formattedErrors,
      errorMatrix,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Node revisions invalidate same-identity getters.
  }, [
    node,
    disabled,
    revision,
    formatError,
    checkShowError,
    context,
    visibility,
  ]);
};
