import { type ComponentType, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';

import type { FieldNode } from '@/schema-form/core';
import type { ErrorMessageRendererProps } from '@/schema-form/types';

/**
 * Bind immutable field identity without reading errors, visibility or context.
 * @param Renderer - Registered component that owns the error root.
 * @param node - Source node, or absence for an empty part.
 * @param required - The group's resolved display requirement.
 * @param name - Current name, present whenever node is present.
 * @param path - Current address, present whenever node is present.
 * @param jsonSchema - Current schema, present whenever node is present.
 * @returns A memoized part receiving its message exclusively through props.
 */
export const createErrorMessagePart = (
  Renderer: ComponentType<ErrorMessageRendererProps>,
  node: FieldNode | null | undefined,
  required: boolean,
  name: FieldNode['name'] | undefined,
  path: FieldNode['path'] | undefined,
  jsonSchema: FieldNode['jsonSchema'] | undefined,
): ComponentType<Partial<ErrorMessageRendererProps>> => {
  if (!node) return NULL_FUNCTION;
  return memo((props: Partial<ErrorMessageRendererProps>) => (
    <Renderer
      path={path!}
      name={name!}
      jsonSchema={jsonSchema!}
      required={required}
      {...props}
      node={node}
    />
  ));
};
