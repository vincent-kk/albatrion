import type { CSSProperties } from 'react';

import type { LabelRendererProps } from '@/schema-form/types';

/** Required markers are presentational and excluded from the accessible label. */
const REQUIRED_MARK_STYLE: CSSProperties = { color: 'red' };

/** Render the registered label root with exactly one child for a non-required field. */
export const LabelRenderer = ({
  children,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps) => (
  <label htmlFor={htmlFor} id={id} style={style} className={className}>
    {required ? (
      <>
        {children}{' '}
        <span aria-hidden style={REQUIRED_MARK_STYLE}>
          *
        </span>
      </>
    ) : (
      children
    )}
  </label>
);
