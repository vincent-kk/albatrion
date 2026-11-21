import type { ReactElement } from 'react';

import { Flex, Typography } from 'antd';

import { EMPTY_OBJECT } from '@winglet/common-utils/constant';
import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { TEXT_STYLE } from './styles';

/**
 * Assemble plugin parts while preserving the existing group structure and empty error line.
 * @param props - Bound field parts, node strategy and indentation depth.
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
          {node.parentNode && isArraySchema(node.parentNode) === false && (
            <Label />
          )}
          <Input readOnly={readOnly} disabled={disabled} />
        </Flex>
        {error}
      </div>
    );
  }
};
