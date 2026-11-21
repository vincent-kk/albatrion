import type { ReactElement } from 'react';

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
}: FieldRendererProps): ReactElement => {
  const error =
    errorMessage != null &&
    (errorMessage !== '' || (depth > 0 && node.strategy !== 'branch')) &&
    typeof errorMessage !== 'boolean' ? (
      <ErrorMessage>{errorMessage}</ErrorMessage>
    ) : null;
  if (depth === 0)
    return (
      <>
        <Input />
        {error}
      </>
    );

  const title = node.parentNode && !isArraySchema(node.parentNode) && <Label />;
  return (
    <Space direction="vertical" block>
      <div>
        {title}
        <Input />
      </div>
      {error}
    </Space>
  );
};
