import { Box, FormControl, FormLabel, Typography } from '@mui/material';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormGroup = ({
  node,
  depth,
  path,
  name,
  required,
  Input,
  errorMessage,
}: FormTypeRendererProps) => {
  // depth가 0이면 최상위 레벨이므로 Input만 렌더링
  if (depth === 0) return <Input />;

  // object, array, virtual 타입은 fieldset으로 그룹핑
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
        <Typography component="legend" variant="body2" sx={{ px: 1 }}>
          {name}
        </Typography>
        <Input />
      </Box>
    );
  } else {
    // 일반 필드는 FormControl로 래핑
    return (
      <Box
        sx={{
          marginBottom: 2,
          marginLeft: depth * 2, // depth에 따른 들여쓰기
        }}
      >
        <FormControl fullWidth error={!!errorMessage}>
          {/* array의 item들은 라벨을 표시하지 않음 */}
          {node.parentNode?.type !== 'array' && (
            <FormLabel htmlFor={path} required={required} sx={{ mb: 1 }}>
              {name}
            </FormLabel>
          )}
          <Input />
          {errorMessage}
        </FormControl>
      </Box>
    );
  }
};
