import type { ReactNode } from 'react';

import { isPlainObject } from '@winglet/common-utils/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { readLabel } from './resolveFieldLabel/readLabel';

/**
 * Use the author's field label for both visible and hidden title elements.
 * @param schema - Current field schema, including optional presentation labels.
 * @param name - Field key or array index used as a fallback.
 * @param label - Explicit label content for the current renderer or input.
 * @returns Content referenced by the field's accessible name.
 */
export const resolveFieldLabel = (
  schema: FieldRendererProps['jsonSchema'],
  name: string,
  label?: ReactNode,
): ReactNode => {
  const explicit = readLabel(label);
  if (explicit || explicit === 0) return explicit;
  if (typeof schema !== 'object' || schema === null) return name;
  const presentation = isPlainObject(schema.presentation)
    ? schema.presentation
    : undefined;
  const renderer = presentation?.FieldRendererProps;
  const input = presentation?.FieldInputProps;
  const authoredLabel =
    readLabel(isPlainObject(renderer) ? renderer.label : undefined) ??
    readLabel(isPlainObject(input) ? input.label : undefined);
  if (authoredLabel || authoredLabel === 0) return authoredLabel;
  const title = typeof schema.title === 'string' ? readLabel(schema.title) : '';
  const ariaLabel = isPlainObject(schema.options)
    ? readLabel(schema.options['aria-label'])
    : undefined;
  return title || ariaLabel || name;
};
