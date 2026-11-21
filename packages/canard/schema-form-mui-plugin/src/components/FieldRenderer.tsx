import { type ReactElement, useMemo } from 'react';

import { Box } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';

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
  const title = useMemo(
    () => resolveFieldLabel(jsonSchema, name),
    [jsonSchema, name],
  );
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

  const titleElement = title ? (
    <span hidden={!isChoiceGroup} id={labelId}>
      {title}
    </span>
  ) : null;
  if (depth === 0)
    return (
      <>
        {titleElement}
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
        aria-labelledby={!ownsTitle && title ? labelId : undefined}
        sx={{
          marginBottom: 1,
          marginLeft: depth * 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          padding: 1,
        }}
      >
        {titleElement}
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
        {titleElement}
        <Input />
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
