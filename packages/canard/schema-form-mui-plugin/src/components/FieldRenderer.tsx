import { Box } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Connect group titles through the core label address while retaining the helper root.
 * @param props - Bound field parts, node strategy and indentation depth.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  name,
  labelId,
  depth,
  Input,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  if (depth === 0) return <Input labelId={labelId} />;

  if (node.strategy === 'branch') {
    return (
      <Box
        component="fieldset"
        aria-labelledby={labelId}
        sx={{
          marginBottom: 1,
          marginLeft: depth * 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 1,
        }}
      >
        <Box component="legend" id={labelId}>
          {name}
        </Box>
        <Input labelId={labelId} />
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
        <Input labelId={labelId} />
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
