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
}: FieldRendererProps): ReactElement => {
  const isBranch = node.strategy === 'branch';
  const hasErrorMessage =
    errorMessage != null &&
    errorMessage !== '' &&
    typeof errorMessage !== 'boolean';
  const error =
    hasErrorMessage || (depth > 0 && !isBranch) ? (
      <ErrorMessage style={EMPTY_OBJECT}>{errorMessage}</ErrorMessage>
    ) : null;
  if (depth === 0)
    return (
      <>
        <Input />
        {error}
      </>
    );

  if (isBranch) {
    return (
      <fieldset
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
      >
        <legend id={labelId}>
          <Typography.Text style={TEXT_STYLE}>{name}</Typography.Text>
        </legend>
        <Input />
        {error}
      </fieldset>
    );
  } else {
    return (
      <div
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
      >
        <Flex gap={10} align="center">
          {node.parentNode && isArraySchema(node.parentNode) === false && (
            <Label />
          )}
          <Input />
        </Flex>
        {error}
      </div>
    );
  }
};
