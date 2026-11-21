import type { CSSProperties, ReactElement } from 'react';

import type { LabelRendererProps } from '@canard/schema-form';

import { resolveFieldLabel } from '../utils/resolveFieldLabel';

/** Preserve the required marker spacing and color. */
const REQUIRED_STYLE: CSSProperties = { marginLeft: 4, color: 'red' };

/**
 * Render a mobile label with binding-owned addresses and caller-owned styling.
 * @param props - Explicit content, accessibility addresses, requirement and root styling.
 * @returns The plugin label root with an inaccessible required marker.
 */
export const LabelRenderer = ({
  children,
  name,
  jsonSchema,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps): ReactElement => (
  <label htmlFor={htmlFor} id={id} style={style} className={className}>
    {resolveFieldLabel(
      jsonSchema,
      name,
      children === name ? undefined : children,
    )}
    {required && (
      <span aria-hidden style={REQUIRED_STYLE}>
        *
      </span>
    )}
  </label>
);
