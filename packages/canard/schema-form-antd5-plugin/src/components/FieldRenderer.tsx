import type { CSSProperties } from 'react';

import { Flex, Typography } from 'antd';

import { EMPTY_OBJECT } from '@winglet/common-utils/constant';
import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

/** Legends use the same wrapping as registered labels. */
const TITLE_STYLE: CSSProperties = { wordBreak: 'unset' };

/**
 * Assemble plugin parts while preserving the existing group structure and empty error line.
 * @param props - Bound field parts, node strategy and indentation depth.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  depth,
  name,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <fieldset
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
      >
        <legend>
          <Typography.Text style={TITLE_STYLE}>{name}</Typography.Text>
        </legend>
        <Input />
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
        <ErrorMessage style={EMPTY_OBJECT}>{errorMessage}</ErrorMessage>
      </div>
    );
  }
};
