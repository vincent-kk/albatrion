import { Fragment, type ReactNode, isValidElement } from 'react';

/**
 * Extract nonempty React label content from opaque presentation metadata.
 * @param value - Candidate text, number, element, or sequence.
 * @returns Label content or undefined for an empty candidate.
 */
export const readLabel = (value: unknown): ReactNode => {
  if (typeof value === 'string')
    return value.trim().replace(/\s+/g, ' ') || undefined;
  if (Array.isArray(value)) {
    const labels = value.map(readLabel).filter((label) => label !== undefined);
    return labels.length ? labels : undefined;
  }
  if (isValidElement<{ children?: unknown }>(value))
    return value.type === Fragment ? readLabel(value.props.children) : value;
  return typeof value === 'number' ? value : undefined;
};
