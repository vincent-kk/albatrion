import type { ReactElement } from 'react';

import { Flex, Typography } from 'antd';

import { EMPTY_OBJECT } from '@winglet/common-utils/constant';
import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { TEXT_STYLE } from './styles';

/**
 * Assemble plugin parts while preserving the existing group structure and empty error line.
 * A nested branch shows its name in a legend carrying `labelId`. A leaf under a
 * non-array parent shows `Label`; an array item leaf instead gets a hidden title
 * carrying `labelId` and its index for the input's `aria-labelledby`.
 * @param props - Bound field parts, node strategy, indentation depth and title address.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  depth,
  name,
  labelId,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
  readOnly,
  disabled,
  className,
  style,
}: FieldRendererProps): ReactElement => {
  const isBranch = node.strategy === 'branch';
  const error =
    (depth > 0 && !isBranch) ||
    (errorMessage != null &&
      errorMessage !== '' &&
      typeof errorMessage !== 'boolean') ? (
      <ErrorMessage style={EMPTY_OBJECT}>{errorMessage}</ErrorMessage>
    ) : null;
  if (depth === 0)
    return (
      <>
        <Input
          readOnly={readOnly}
          disabled={disabled}
          {...(className != null && { className })}
          {...(style != null && { style })}
        />
        {error}
      </>
    );

  if (isBranch) {
    return (
      <fieldset
        className={className}
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
          ...style,
        }}
      >
        <legend id={labelId}>
          <Typography.Text style={TEXT_STYLE}>{name}</Typography.Text>
        </legend>
        <Input readOnly={readOnly} disabled={disabled} />
        {error}
      </fieldset>
    );
  } else {
    return (
      <div
        className={className}
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
          ...style,
        }}
      >
        <Flex gap={10} align="center">
          {node.parentNode && isArraySchema(node.parentNode) === false ? (
            <Label />
          ) : (
            <span hidden id={labelId}>
              {name}
            </span>
          )}
          <Input readOnly={readOnly} disabled={disabled} />
        </Flex>
        {error}
      </div>
    );
  }
};
