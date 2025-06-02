import { Box } from '@mui/material';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormGroup = ({
  node,
  depth,
  Input,
  errorMessage,
}: FormTypeRendererProps) => {
  // depth가 0이면 최상위 레벨이므로 Input만 렌더링
  if (depth === 0) return <Input />;

  if (
    node.type === 'object' ||
    node.type === 'array' ||
    node.type === 'virtual'
  ) {
    return (
      <Box
        component="fieldset"
        sx={{
          marginBottom: 1,
          marginLeft: depth * 2, // depth에 따른 들여쓰기
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
          marginLeft: depth * 2, // depth에 따른 들여쓰기
        }}
      >
        <Input />
        {errorMessage}
      </Box>
    );
  }
};
