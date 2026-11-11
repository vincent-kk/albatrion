import { type ComponentType, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';

import type { FieldNode } from '@/schema-form/core';
import type { LabelRendererProps } from '@/schema-form/types';

/**
 * Bind immutable field identity to a label without subscriptions or implicit context.
 * @param Renderer - Registered component that owns the label root.
 * @param node - Source node, or absence for an empty part.
 * @param required - The group's resolved display requirement.
 * @param name - Current name, present whenever node is present.
 * @param path - Current address, present whenever node is present.
 * @param jsonSchema - Current schema, present whenever node is present.
 * @returns A memoized label whose explicit props override defaults except node.
 */
export const createLabelPart = (
  Renderer: ComponentType<LabelRendererProps>,
  node: FieldNode | null | undefined,
  required: boolean,
  name: FieldNode['name'] | undefined,
  path: FieldNode['path'] | undefined,
  jsonSchema: FieldNode['jsonSchema'] | undefined,
): ComponentType<Partial<LabelRendererProps>> => {
  if (!node) return NULL_FUNCTION;
  return memo(({ children, ...props }: Partial<LabelRendererProps>) => (
    <Renderer
      path={path!}
      name={name!}
      jsonSchema={jsonSchema!}
      required={required}
      htmlFor={path}
      id={'label:' + path}
      {...props}
      node={node}
    >
      {children === undefined ? name : children}
    </Renderer>
  ));
};
