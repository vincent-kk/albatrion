import type { CSSProperties } from 'react';

import { Typography } from 'antd';

import type { LabelRendererProps } from '@canard/schema-form';

/** Keep title wrapping consistent with the group legend. */
const TITLE_STYLE: CSSProperties = { wordBreak: 'unset' };
/** Preserve the visual required marker while excluding it from the accessible name. */
const REQUIRED_STYLE: CSSProperties = { marginLeft: 4 };

/**
 * Render the registered label root and its explicit content.
 * @param props - Explicit content, accessibility addresses, requirement and root styling.
 * @returns The plugin label root with an inaccessible required marker.
 */
export const FormLabel = ({
  children,
  htmlFor,
  id,
  required,
  style,
  className,
}: LabelRendererProps) => (
  <label htmlFor={htmlFor} id={id} style={style} className={className}>
    <Typography.Text style={TITLE_STYLE}>{children}</Typography.Text>
    {required && (
      <Typography.Text type="danger" aria-hidden style={REQUIRED_STYLE}>
        *
      </Typography.Text>
    )}
  </label>
);
