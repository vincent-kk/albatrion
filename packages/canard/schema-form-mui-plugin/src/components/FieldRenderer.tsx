import { Box } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

import { FieldLabelContext } from '../utils/context/FieldLabelContext';
import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';

/**
 * Connect group titles through the core label address while retaining the helper root.
 * @param props - Bound field parts, node strategy and indentation depth.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  name,
  labelId,
  jsonSchema,
  depth,
  Input,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  if (depth === 0)
    return (
      <FieldLabelContext.Provider value={labelId}>
        <Input />
      </FieldLabelContext.Provider>
    );

  if (node.strategy === 'branch') {
    const presentation =
      typeof jsonSchema === 'object' && jsonSchema !== null
        ? jsonSchema.presentation
        : undefined;
    const inputType =
      typeof presentation === 'object' &&
      presentation !== null &&
      'inputType' in presentation &&
      typeof presentation.inputType === 'string'
        ? presentation.inputType
        : undefined;
    const ownsTitle =
      typeof jsonSchema === 'object' &&
      jsonSchema !== null &&
      isCheckboxGroupInput({ type: node.type, inputType, jsonSchema });
    return (
      <Box
        component={ownsTitle ? 'div' : 'fieldset'}
        aria-labelledby={ownsTitle ? undefined : labelId}
        sx={{
          marginBottom: 1,
          marginLeft: depth * 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 1,
        }}
      >
        {!ownsTitle && (
          <span hidden id={labelId}>
            {name}
          </span>
        )}
        <FieldLabelContext.Provider value={labelId}>
          <Input />
        </FieldLabelContext.Provider>
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
        <FieldLabelContext.Provider value={labelId}>
          <Input />
        </FieldLabelContext.Provider>
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
