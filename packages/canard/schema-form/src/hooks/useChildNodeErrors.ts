import {
  type ReactNode,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

import {
  type SchemaNode,
  SchemaNodeEventType,
  type ValidationIssue,
} from '@/schema-form/core';
import {
  useFormTypeRendererContext,
  useWorkspaceContext,
} from '@/schema-form/providers';

/** Read direct-child issues and visibility, resubscribing when children or paths change. */
export const useChildNodeErrors = (
  node: SchemaNode,
  disabled?: boolean,
): {
  errorMessage: ReactNode;
  showError: boolean;
  formattedError: ReactNode;
  showErrors: boolean[];
  formattedErrors: ReactNode[];
  errorMatrix: (readonly ValidationIssue[])[];
} => {
  const { formatError, checkShowError } = useFormTypeRendererContext();
  const { context } = useWorkspaceContext();
  const mask =
    SchemaNodeEventType.UpdateChildren |
    SchemaNodeEventType.UpdateState |
    SchemaNodeEventType.UpdatePath |
    SchemaNodeEventType.UpdateError;
  const children = node.children;
  const subscribe = useCallback(
    (update: () => void) => {
      if (disabled) return () => {};
      const unsubscribes = [node, ...(children ?? [])].map((child) =>
        child.subscribe(({ type }) => {
          if (type & mask) update();
        }),
      );
      return () => {
        for (const unsubscribe of unsubscribes) unsubscribe();
      };
    },
    [node, children, disabled, mask],
  );
  const snapshot = useCallback(
    () =>
      [node, ...(node.children ?? [])]
        .map((child) => child.revision(mask))
        .join(':'),
    [node, mask],
  );
  const revision = useSyncExternalStore(subscribe, snapshot, snapshot);
  return useMemo(() => {
    const current = node.children ?? [];
    const errorMatrix = current.map((child) => (disabled ? [] : child.errors));
    const formattedErrors = errorMatrix.map((errors, index) =>
      errors.length ? formatError(errors[0], current[index], context) : null,
    );
    const showErrors = current.map(
      (child) => !disabled && checkShowError(child.state),
    );
    const formattedError =
      formattedErrors.find((message) => message != null) ?? null;
    const showError =
      !disabled && (checkShowError(node.state) || showErrors.some(Boolean));
    return {
      errorMessage: showError ? formattedError : null,
      showError,
      formattedError,
      showErrors,
      formattedErrors,
      errorMatrix,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Node revisions invalidate same-identity getters.
  }, [node, disabled, revision, formatError, checkShowError, context]);
};
