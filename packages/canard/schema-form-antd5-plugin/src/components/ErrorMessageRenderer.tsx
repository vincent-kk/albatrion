import type { ReactElement } from 'react';

import { Typography } from 'antd';

import type { ErrorMessageRendererProps } from '@canard/schema-form';

import { TEXT_STYLE } from './styles';

/**
 * Render explicit error content in the typography root.
 * @param props - Explicit message content and root styling.
 * @returns The plugin error root, including an empty root when called without content.
 */
export const ErrorMessageRenderer = ({
  children,
  style,
  className,
}: ErrorMessageRendererProps): ReactElement => (
  <Typography.Text
    type="danger"
    style={style ?? TEXT_STYLE}
    className={className}
  >
    {children}
  </Typography.Text>
);
