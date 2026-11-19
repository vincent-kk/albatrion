import type { CSSProperties } from 'react';

import { Flex, Typography } from 'antd';

import { EMPTY_OBJECT } from '@winglet/common-utils/constant';
import { isArraySchema } from '@winglet/json-schema/filter';

import type { FieldRendererProps } from '@canard/schema-form';

import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';
import { isRadioGroupInput } from '../utils/inputs/isRadioGroupInput';

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
  labelId,
  jsonSchema,
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
    (isRadioGroupInput(hint) || isCheckboxGroupInput(hint));
  if (depth === 0) return <Input />;

  if (node.strategy === 'branch') {
    return (
      <fieldset
        aria-labelledby={labelId}
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
      >
        <legend id={labelId}>
          <Typography.Text style={TITLE_STYLE}>{name}</Typography.Text>
        </legend>
        <Input aria-labelledby={labelId} />
        <ErrorMessage style={EMPTY_OBJECT}>{errorMessage}</ErrorMessage>
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
            <Label {...(grouped ? { htmlFor: undefined } : {})} />
          )}
          <Input
            aria-labelledby={
              node.parentNode && !isArraySchema(node.parentNode)
                ? labelId
                : undefined
            }
          />
        </Flex>
        <ErrorMessage style={EMPTY_OBJECT}>{errorMessage}</ErrorMessage>
      </div>
    );
  }
};
