import type { ReactElement } from 'react';

import { Box } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Keep MUI group layout label-free and retain its helper root.
 * @param props - Bound field parts, node strategy and indentation depth.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  depth,
  Input,
  ErrorMessage,
  errorMessage,
  readOnly,
  disabled,
  className,
  style,
}: FieldRendererProps): ReactElement => {
  const hasError =
    errorMessage != null &&
    errorMessage !== '' &&
    typeof errorMessage !== 'boolean';
  if (depth === 0)
    return (
      <>
        <Input
          readOnly={readOnly}
          disabled={disabled}
          {...(className != null && { className })}
          {...(style != null && { style })}
        />
        {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </>
    );

  if (node.strategy === 'branch') {
    return (
      <Box
        className={className}
        style={style}
        component="fieldset"
        sx={{
          marginBottom: 1,
          marginLeft: depth * 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 1,
        }}
      >
        <Input readOnly={readOnly} disabled={disabled} />
        {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </Box>
    );
  } else {
    return (
      <Box
        className={className}
        style={style}
        sx={{
          marginBottom: 2,
          marginLeft: depth * 2,
        }}
      >
        <Input readOnly={readOnly} disabled={disabled} />
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
