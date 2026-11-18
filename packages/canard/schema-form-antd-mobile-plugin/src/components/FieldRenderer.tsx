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
  name,
  labelId,
  jsonSchema,
  depth,
  Input,
  Label,
  ErrorMessage,
  errorMessage,
}: FieldRendererProps) => {
  const presentation =
    typeof jsonSchema === 'object' && jsonSchema !== null
      ? jsonSchema.presentation
      : undefined;
  const inputType =
    typeof presentation === 'object' &&
    presentation !== null &&
    'inputType' in presentation
      ? presentation.inputType
      : undefined;
  const grouped =
    inputType === 'radio' ||
    inputType === 'radiogroup' ||
    inputType === 'checkbox' ||
    inputType === 'switch' ||
    (typeof jsonSchema === 'object' &&
      'format' in jsonSchema &&
      jsonSchema.format === 'slider');
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <fieldset
        aria-labelledby={labelId}
        style={{ border: 0, margin: 0, padding: 0 }}
      >
        <legend id={labelId}>{name}</legend>
        <Space direction="vertical" block>
          <Input aria-labelledby={labelId} />
        </Space>
      </fieldset>
    );
  } else {
    return (
      <Space direction="vertical" block>
        <div>
          {node.parentNode && isArraySchema(node.parentNode) === false && (
            <Label {...(grouped ? { htmlFor: undefined } : {})} />
          )}
          <Input
            aria-labelledby={
              node.parentNode && !isArraySchema(node.parentNode)
                ? labelId
                : undefined
            }
          />
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
