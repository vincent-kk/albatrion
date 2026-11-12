import { Space } from 'antd-mobile';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

/**
 * Assemble mobile parts without adding Space items for absent message children.
 * @param props - Bound field parts, node strategy and indentation depth.
 * @returns The existing group structure composed with registered parts.
 */
export const FieldRenderer = ({
  node,
  depth,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <Space direction="vertical" block>
        <Input />
      </Space>
    );
  } else {
    return (
      <Space direction="vertical" block>
        <div>
          {node.parentNode && isArraySchema(node.parentNode) === false && (
            <Label />
          )}
          <Input />
        </div>
        {errorMessage !== null &&
          errorMessage !== undefined &&
          typeof errorMessage !== 'boolean' && (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          )}
      </Space>
    );
  }
};
