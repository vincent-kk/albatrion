import type { ReactElement } from 'react';

import { Box } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

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
}: FieldRendererProps): ReactElement => {
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
  const isChoiceGroup =
    ownsTitle ||
    ((inputType === 'radio' || inputType === 'radiogroup') &&
      typeof jsonSchema === 'object' &&
      jsonSchema !== null &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 0);
  if (depth === 0)
    return (
      <>
        <span hidden={!isChoiceGroup} id={labelId}>
          {name}
        </span>
        <Input />
        {errorMessage !== null &&
          errorMessage !== undefined &&
          typeof errorMessage !== 'boolean' && (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          )}
      </>
    );

  if (node.strategy === 'branch') {
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
        <span hidden={!isChoiceGroup} id={labelId}>
          {name}
        </span>
        <Input />
        <ErrorMessage>{errorMessage}</ErrorMessage>
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
        <span hidden={!isChoiceGroup} id={labelId}>
          {name}
        </span>
        <Input />
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
