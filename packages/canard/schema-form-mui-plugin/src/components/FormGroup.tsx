import { Box } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Keep MUI group layout label-free and retain its helper root.
 * @param props - Bound field parts, node strategy and indentation depth.
 * @returns The existing group structure composed with registered parts.
 */
export const FormGroup = ({
  node,
  depth,
  Input,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <Box
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
        <Input />
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          marginBottom: 2,
          marginLeft: depth * 2,
        }}
      >
        <Input />
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
