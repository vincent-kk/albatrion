import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { map } from '@winglet/common-utils/array';
import { isTruthy } from '@winglet/common-utils/filter';
import { useVersion } from '@winglet/react-utils/hook';

import { NodeEventType, NodeState, type SchemaNode } from '@/schema-form/core';
import {
  useFormTypeRendererContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { JsonSchemaError } from '@/schema-form/types';

import { useSchemaNodeSubscribe } from './useSchemaNodeSubscribe';

/**
 * Manages error states of child nodes in a branch schema node.
 *
 * This hook subscribes to error updates from all child nodes and provides both
 * raw error data and formatted error messages. It automatically handles:
 * - Real-time error state synchronization with child nodes
 * - Dynamic updates when children are added/removed
 * - Error message formatting using the current form renderer context
 * - Cleanup of subscriptions when the component unmounts
 *
 * The hook is designed for branch nodes (containers) that need to display
 * validation errors from their child fields in aggregate or individually.
 *
 * @example
 * ```typescript
 * // Basic usage in a form container component
 * const FormTypeObjectInput = ({ node }: FormTypeInputProps) => {
 *   const { errorMessage, errorMessages, errorMatrix, showError, showErrors } = useChildNodeErrors(node);
 *
 *   return (
 *     <div>
 *       {node.children?.map((child, index) => (
 *         <div key={child.key}>
 *           <ChildComponent node={child.node} />
 *           {showErrors[index] && errorMessages[index] && (
 *             <span className="error">{errorMessages[index]}</span>
 *           )}
 *         </div>
 *       ))}
 *       {showError && errorMessage && (
 *         <div className="summary-error">{errorMessage}</div>
 *       )}
 *     </div>
 *   );
 * };
 *
 * // Usage with disabled state
 * const ConditionalFormSection = ({ node, isDisabled }) => {
 *   const { errorMessages } = useChildNodeErrors(node, isDisabled);
 *   // When disabled=true, errorMessages will be empty array
 * };
 * ```
 *
 * @param node - The branch SchemaNode instance that contains child nodes.
 *                Must be a branch node (not a leaf node).
 * @param disabled - Optional flag to disable error tracking. When true,
 *                   all error states are cleared and no new subscriptions are made.
 *
 * @returns Object containing comprehensive error information:
 * @returns {boolean} showError - Whether any error should be shown.
 * @returns {boolean[]} showErrors - Array of booleans indicating if each child should show an error.
 * @returns {ReactNode} errorMessage - The first non-null error message from errorMessages.
 *                                    Useful for displaying a single summary error.
 * @returns {ReactNode[]} errorMessages - Array of formatted error messages for each child,
 *                                       indexed by child position. Null entries indicate no error.
 * @returns {JsonSchemaError[][]} errorMatrix - 2D array of raw error objects for each child.
 *                                             Useful for custom error processing or debugging.
 */
export const useChildNodeErrors = (
  node: SchemaNode,
  disabled?: boolean,
): {
  showError: boolean;
  showErrors: boolean[];
  errorMessage: ReactNode;
  errorMessages: ReactNode[];
  errorMatrix: JsonSchemaError[][];
} => {
  const { formatError, checkShowError } = useFormTypeRendererContext();
  const { context } = useUserDefinedContext();

  // Track current children and subscribe to structural changes
  const [children, setChildren] = useState(node.children);

  const [errorMatrix, setErrorMatrix] = useState<JsonSchemaError[][]>(() =>
    new Array(children?.length || 0).fill(null).map(() => []),
  );
  const [errorMessages, setErrorMessages] = useState<ReactNode[]>(() =>
    new Array(children?.length || 0).fill(null),
  );

  const nodeStateMap = useRef(
    new Map<string, Parameters<typeof checkShowError>[0]>(),
  );
  const [version, update] = useVersion();

  useSchemaNodeSubscribe(node, ({ type }) => {
    if (type & NodeEventType.UpdateChildren) {
      const children = node.children;
      const length = children?.length || 0;
      setChildren(children);
      setErrorMatrix(new Array(length).fill(null).map(() => []));
      setErrorMessages(new Array(length).fill(null));
    }
    if (type & NodeEventType.UpdateState) {
      const {
        [NodeState.Dirty]: dirty,
        [NodeState.Touched]: touched,
        [NodeState.ShowError]: showError,
      } = node.state;
      nodeStateMap.current.set(node.path, { dirty, touched, showError });
      update();
    }
  });

  // Clear all errors when disabled
  useEffect(() => {
    if (!disabled) return;
    const length = children?.length || 0;
    setErrorMatrix(new Array(length).fill(null).map(() => []));
    setErrorMessages(new Array(length).fill(null));
  }, [disabled, children]);

  // Subscribe to error updates from all child nodes
  useEffect(() => {
    if (disabled) return;
    const childrenLength = children?.length;
    if (!childrenLength) return;

    const unsubscribes = new Array(childrenLength);

    // Create subscription for each child node
    for (let i = 0; i < childrenLength; i++) {
      const node = children[i].node;
      unsubscribes[i] = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateError) {
          const errors = payload?.[NodeEventType.UpdateError];
          const firstError = errors?.find(isTruthy);

          setErrorMatrix((prev) => {
            if (prev[i] === errors) return prev;
            const newErrors = [...prev];
            newErrors[i] = errors || [];
            return newErrors;
          });

          setErrorMessages((prev) => {
            if (prev[i] === firstError) return prev;
            const newErrors = [...prev];
            newErrors[i] = firstError
              ? formatError(firstError, node, context)
              : null;
            return newErrors;
          });
        }
        if (type & NodeEventType.UpdateState) {
          const {
            [NodeState.Dirty]: dirty,
            [NodeState.Touched]: touched,
            [NodeState.ShowError]: showError,
          } = node.state;
          nodeStateMap.current.set(node.path, { dirty, touched, showError });
          update();
        }
      });
    }
    // Cleanup all subscriptions
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [node, disabled, children, formatError, context, update]);

  // Memoized computation of the first available error message
  const errorMessage = useMemo<ReactNode>(
    () => errorMessages.find(isTruthy),
    [errorMessages],
  );

  const showErrors = useMemo(
    () =>
      children
        ? map(children, ({ node }) => {
            const state = nodeStateMap.current.get(node.path);
            return state ? checkShowError(state) : false;
          })
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children, version, checkShowError],
  );

  const showError = useMemo(() => {
    const state = nodeStateMap.current.get(node.path);
    const showError = state ? checkShowError(state) : false;
    return showError || showErrors.some(isTruthy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, version, showErrors, checkShowError]);

  return {
    showError,
    errorMessage,
    showErrors,
    errorMessages,
    errorMatrix,
  };
};
