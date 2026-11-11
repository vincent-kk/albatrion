import type { CSSProperties } from 'react';

import { Typography } from 'antd';

import type { ErrorMessageRendererProps } from '@canard/schema-form';

/** Standalone errors retain their unconstrained word breaking. */
const ERROR_STYLE: CSSProperties = { wordBreak: 'unset' };

/**
 * Render explicit error content in the typography root.
 * @param props - Explicit message content and root styling.
 * @returns The plugin error root, including an empty root when called without content.
 */
export const FormErrorMessage = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps) => (
  <Typography.Text
    type="danger"
    style={style ?? ERROR_STYLE}
    className={className}
  >
    {children}
  </Typography.Text>
);
