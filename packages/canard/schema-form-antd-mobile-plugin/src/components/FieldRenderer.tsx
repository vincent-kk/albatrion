import { Space } from 'antd-mobile';

import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { isBooleanSwitchInput } from '../utils/inputs/isBooleanSwitchInput';
import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';
import { isRadioGroupInput } from '../utils/inputs/isRadioGroupInput';
import { isSliderInput } from '../utils/inputs/isSliderInput';
import { isStringSwitchInput } from '../utils/inputs/isStringSwitchInput';

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
  const hint =
    typeof jsonSchema === 'object' && jsonSchema !== null
      ? {
          type: node.type,
          schemaType: node.schemaType,
          inputType: typeof inputType === 'string' ? inputType : undefined,
          format:
            'format' in jsonSchema && typeof jsonSchema.format === 'string'
              ? jsonSchema.format
              : undefined,
          jsonSchema,
        }
      : undefined;
  const grouped =
    hint !== undefined &&
    (isRadioGroupInput(hint) ||
      isCheckboxGroupInput(hint) ||
      isBooleanSwitchInput(hint) ||
      isStringSwitchInput(hint) ||
      isSliderInput(hint));
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <fieldset
        aria-labelledby={labelId}
        style={{ border: 0, margin: 0, padding: 0 }}
      >
        <span hidden id={labelId}>
          {name}
        </span>
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
