import {
  type ReactNode,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { map as mapArray } from '@winglet/common-utils/array';
import { NOOP_FUNCTION } from '@winglet/common-utils/constant';

import {
  type FieldNode,
  FieldNodeEventType,
  type ValidationIssue,
} from '@/schema-form/core';
import {
  useFieldRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';
import { useErrorVisibility } from '@/schema-form/providers/FieldRendererContext';

/** Event mask that invalidates a node's and its direct children's error view. */
const CHILD_FIELD_ERROR_EVENTS =
  FieldNodeEventType.UpdateChildren |
  FieldNodeEventType.UpdateState |
  FieldNodeEventType.UpdatePath |
  FieldNodeEventType.UpdateError;

/** Read direct-child issues and visibility, resubscribing when children or paths change. */
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
  const subscribe = useCallback(
    (update: () => void) => {
      if (disabled) return NOOP_FUNCTION;
      const unsubscribes = mapArray([node, ...(children ?? [])], (child) =>
        child.subscribe(({ type }) => {
          if (type & CHILD_FIELD_ERROR_EVENTS) update();
        }),
      );
      return () => {
        for (const unsubscribe of unsubscribes) unsubscribe();
      };
    },
    [node, children, disabled],
  );
  const snapshot = useCallback(
    () =>
      mapArray([node, ...(node.children ?? [])], (child) =>
        child.revision(CHILD_FIELD_ERROR_EVENTS),
      ).join(':'),
    [node],
  );
  const revision = useSyncExternalStore(subscribe, snapshot, snapshot);

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
    const showError = visible.some(Boolean);

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
