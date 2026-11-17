import type { CSSProperties } from 'react';

import type { LabelRendererProps } from '@canard/schema-form';

/** Preserve the required marker spacing and color. */
const REQUIRED_STYLE: CSSProperties = { marginLeft: 4, color: 'red' };

/**
 * Render a mobile label with binding-owned addresses and caller-owned styling.
 * @param props - Explicit content, accessibility addresses, requirement and root styling.
 * @returns The plugin label root with an inaccessible required marker.
 */
export const LabelRenderer = ({
  children,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps) => (
  <label htmlFor={htmlFor} id={id} style={style} className={className}>
    {children}
    {required && (
      <span aria-hidden style={REQUIRED_STYLE}>
        *
      </span>
    )}
  </label>
);
