import { type ComponentType, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';

import { ErrorMessageRenderer as FallbackErrorMessageRenderer } from '@/schema-form/components/FallbackComponents';
import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';
import { useFieldNodeTracker } from '@/schema-form/hooks';
import type { ErrorMessageRendererProps } from '@/schema-form/types';

import { hasArrayAncestor } from './hasArrayAncestor';

/** Only address deliveries invalidate a mounted error part. */
const RERENDERING_EVENT = FieldNodeEventType.UpdatePath;

/**
 * Bind an error part, tracking mutable addresses and directly rendering the pure fallback.
 * @param Renderer - Registered component that owns the error root.
 * @param node - Source node, or absence for an empty part.
 * @param required - The group's resolved display requirement.
 * @param jsonSchema - Current schema, present whenever node is present.
 * @returns A memoized part receiving its message exclusively through props.
 */
export const createErrorMessagePart = (
  Renderer: ComponentType<ErrorMessageRendererProps>,
  node: FieldNode | null | undefined,
  required: boolean,
  jsonSchema: FieldNode['jsonSchema'] | undefined,
): ComponentType<Partial<ErrorMessageRendererProps>> => {
  if (!node) return NULL_FUNCTION;
  const isFallback = Renderer === FallbackErrorMessageRenderer;
  const render = function ErrorMessage(
    props: Partial<ErrorMessageRendererProps>,
  ) {
    const rendererProps: ErrorMessageRendererProps = {
      path: node.path,
      name: node.name,
      jsonSchema: jsonSchema!,
      required,
      ...props,
      node,
    };
    return isFallback ? (
      FallbackErrorMessageRenderer(rendererProps)
    ) : (
      <Renderer {...rendererProps} />
    );
  };
  return memo(
    hasArrayAncestor(node)
      ? function ErrorMessage(props: Partial<ErrorMessageRendererProps>) {
          useFieldNodeTracker(node, RERENDERING_EVENT);
          return render(props);
        }
      : render,
  );
};
