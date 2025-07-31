import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { isTruthy } from '@winglet/common-utils';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';
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
 *   const { errorMessage, errorMessages, errorMatrix } = useChildNodeErrors(node);
 *
 *   return (
 *     <div>
 *       {node.children?.map((child, index) => (
 *         <div key={child.key}>
 *           <ChildComponent node={child.node} />
 *           {errorMessages[index] && (
 *             <span className="error">{errorMessages[index]}</span>
 *           )}
 *         </div>
 *       ))}
 *       {errorMessage && (
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
  errorMessage: ReactNode;
  errorMessages: ReactNode[];
  errorMatrix: JsonSchemaError[][];
} => {
  const { formatError } = useFormTypeRendererContext();
  const { context } = useUserDefinedContext();

  // Track current children and subscribe to structural changes
  const [children, setChildren] = useState(node.children);
  useSchemaNodeSubscribe(node, ({ type }) => {
    if (type & NodeEventType.UpdateChildren) {
      const children = node.children;
      const length = children?.length;
      setChildren(children);
      // Reset error states when children structure changes
      setErrorMatrix(length ? new Array(length).fill(null).map(() => []) : []);
      setErrorMessages(length ? new Array(length).fill(null) : []);
    }
  });

  // Initialize error tracking arrays based on current children
  const [errorMatrix, setErrorMatrix] = useState<JsonSchemaError[][]>(() =>
    children?.length ? new Array(children.length).fill(null).map(() => []) : [],
  );
  const [errorMessages, setErrorMessages] = useState<ReactNode[]>(() =>
    children?.length ? new Array(children.length).fill(null) : [],
  );

  // Clear all errors when disabled
  useEffect(() => {
    if (!disabled) return;
    setErrorMatrix([]);
    setErrorMessages([]);
  }, [disabled]);

  // Subscribe to error updates from all child nodes
  useEffect(() => {
    if (disabled) return;
    const childrenLength = children?.length;
    if (!childrenLength) return;

    const unsubscribes = new Array(childrenLength);

    // Create subscription for each child node
    for (let i = 0; i < childrenLength; i++) {
      const childNode = children[i].node;
      unsubscribes[i] = childNode.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateError) {
          const errors = payload?.[NodeEventType.UpdateError];
          const firstError = errors?.find(isTruthy);

          // Update raw error matrix
          setErrorMatrix((prev) => {
            const newErrors = [...prev];
            newErrors[i] = errors || [];
            return newErrors;
          });

          // Update formatted error messages
          setErrorMessages((prev) => {
            const newErrors = [...prev];
            newErrors[i] = firstError
              ? formatError(firstError, childNode, context)
              : null;
            return newErrors;
          });
        }
      });
    }

    // Cleanup all subscriptions
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [node, disabled, children, formatError, context]);

  // Memoized computation of the first available error message
  const errorMessage = useMemo<ReactNode>(
    () => errorMessages.find(isTruthy),
    [errorMessages],
  );

  return { errorMessage, errorMessages, errorMatrix };
};
