import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { isTruthy } from '@winglet/common-utils';

import { NodeEventType, type SchemaNode } from '@/schema-form/core';
import {
  useFormTypeRendererContext,
  useUserDefinedContext,
} from '@/schema-form/providers';
import type { JsonSchemaError } from '@/schema-form/types';

/**
 * Hook for using error states of virtual nodes and their child fields.
 * Subscribes to error updates from child nodes and provides formatted error messages.
 *
 * @example
 * ```typescript
 * const FormTypeSomeVirtualInput = ({ node }:FormTypeInputProps) => {
 *   const { errorMatrix, errorMessages } = useVirtualNodeError(node);
 *   return (
 *     <div>
 *       ... // Input Components
 *       {errorMessages.map((error, i) => error && <span key={i}>{error}</span>)}
 *     </div>
 *   );
 * };
 * ```
 *
 * @param node - Virtual SchemaNode instance (must be virtual node)
 * @returns Object containing error information
 * @returns {ReactNode} errorMessage - First error message found in errorMessages
 * @returns {ReactNode[]} errorMessages - Formatted error messages for each child field
 * @returns {JsonSchemaError[][]} errorMatrix - array of errors for each child field
 */
export const useVirtualNodeError = (
  node: SchemaNode,
): {
  errorMessage: ReactNode;
  errorMessages: ReactNode[];
  errorMatrix: JsonSchemaError[][];
} => {
  const { formatError } = useFormTypeRendererContext();
  const { context } = useUserDefinedContext();

  const [errorMatrix, setErrorMatrix] = useState<JsonSchemaError[][]>([]);
  const [errorMessages, setErrorMessages] = useState<ReactNode[]>([]);
  useEffect(() => {
    if (node.type !== 'virtual') return;
    const children = node.children;
    const unsubscribes = new Array(children.length);
    for (let i = 0; i < children.length; i++) {
      const childNode = children[i].node;
      unsubscribes[i] = childNode.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateError) {
          const errors = payload?.[NodeEventType.UpdateError];
          const firstError = errors?.find(isTruthy);
          setErrorMatrix((prev) => {
            const newErrors = [...prev];
            newErrors[i] = errors || [];
            return newErrors;
          });
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
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [node, formatError, context]);

  const errorMessage = useMemo<ReactNode>(
    () => errorMessages.find(isTruthy),
    [errorMessages],
  );

  return { errorMessage, errorMessages, errorMatrix };
};
