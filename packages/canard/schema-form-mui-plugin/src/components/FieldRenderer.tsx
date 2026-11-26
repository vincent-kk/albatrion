import type { ReactElement } from 'react';

import { Box } from '@mui/material';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Keep MUI group layout free of visible titles and retain its helper root.
 * A nested array and an array item get a hidden title carrying `labelId` and
 * the name (an array item's index): the array group and the items, whose
 * captions the array input hides, reference it through `aria-labelledby`.
 * @param props - Bound field parts, node strategy, indentation depth and title address.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  depth,
  name,
  labelId,
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

  const hiddenTitle = (isArraySchema(node) ||
    (node.parentNode != null && isArraySchema(node.parentNode))) && (
    <span hidden id={labelId}>
      {name}
    </span>
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
        {hiddenTitle}
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
        {hiddenTitle}
        <Input readOnly={readOnly} disabled={disabled} />
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </Box>
    );
  }
};
