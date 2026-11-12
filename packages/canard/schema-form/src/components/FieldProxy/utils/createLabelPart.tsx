import { type ComponentType, memo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';

import { LabelRenderer as FallbackLabelRenderer } from '@/schema-form/components/FallbackComponents';
import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';
import { useFieldNodeTracker } from '@/schema-form/hooks';
import type { LabelRendererProps } from '@/schema-form/types';

import { hasArrayAncestor } from './hasArrayAncestor';

/** Only address deliveries invalidate a mounted label part. */
const RERENDERING_EVENT = FieldNodeEventType.UpdatePath;

/**
 * Bind a label, tracking mutable addresses and directly rendering the pure fallback.
 * @param Renderer - Registered component that owns the label root.
 * @param node - Source node, or absence for an empty part.
 * @param required - The group's resolved display requirement.
 * @param jsonSchema - Current schema, present whenever node is present.
 * @returns A memoized label whose explicit props override defaults except node.
 */
export const createLabelPart = (
  Renderer: ComponentType<LabelRendererProps>,
  node: FieldNode | null | undefined,
  required: boolean,
  jsonSchema: FieldNode['jsonSchema'] | undefined,
): ComponentType<Partial<LabelRendererProps>> => {
  if (!node) return NULL_FUNCTION;
  const isFallback = Renderer === FallbackLabelRenderer;
  const render = function Label({
    children,
    ...props
  }: Partial<LabelRendererProps>) {
    const path = node.path;
    const name = node.name;
    const rendererProps: LabelRendererProps = {
      path,
      name,
      jsonSchema: jsonSchema!,
      required,
      htmlFor: path,
      id: 'label:' + path,
      ...props,
      children: children === undefined ? name : children,
      node,
    };
    return isFallback ? (
      FallbackLabelRenderer(rendererProps)
    ) : (
      <Renderer {...rendererProps} />
    );
  };
  return memo(
    hasArrayAncestor(node)
      ? function Label(props: Partial<LabelRendererProps>) {
          useFieldNodeTracker(node, RERENDERING_EVENT);
          return render(props);
        }
      : render,
  );
};
