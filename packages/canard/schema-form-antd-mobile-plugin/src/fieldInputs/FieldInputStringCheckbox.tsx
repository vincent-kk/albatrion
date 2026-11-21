import { type ReactNode, useMemo } from 'react';

import { Checkbox } from 'antd-mobile';
import type { CheckboxValue } from 'antd-mobile/es/components/checkbox';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  ArraySchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { isCheckboxGroupInput } from '../utils/inputs/isCheckboxGroupInput';
import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useControlIdentifiers } from './utils/controls/useControlIdentifiers';
import { getOwnLabel } from './utils/enum/getOwnLabel';
import { mergeEnumSelection } from './utils/enum/mergeEnumSelection';

type ArrayJSONSchema = ArraySchema & {
  items: StringSchema;
};

interface FieldInputStringCheckboxProps
  extends FieldInputPropsWithSchema<
    Array<string | null>,
    ArrayJSONSchema,
    { checkboxLabels?: { [label: string]: ReactNode } }
  > {
  alias?: { [label: string]: ReactNode };
}

const FieldInputStringCheckbox = ({
  inputId,
  getInputId,
  name,
  jsonSchema,
  readOnly,
  disabled,
  defaultValue,
  onChange,
  context,
  alias,
  misfit,
  labelId: labelledBy,
}: FieldInputStringCheckboxProps) => {
  const titleId = useMeaningfulLabelId(labelledBy);
  const fieldName = useFieldNameFallback(jsonSchema, name);
  const bindControls = useControlIdentifiers(
    inputId,
    name,
    'input',
    getInputId,
  );
  const options = useMemo(() => {
    const labels = context.checkboxLabels || alias || {};
    return jsonSchema.items?.enum
      ? map(jsonSchema.items.enum, (rawValue: string | null) => {
          const value = JSON.stringify(rawValue);
          return {
            value,
            rawValue,
            label: getOwnLabel(labels, '' + rawValue) || '' + rawValue,
          };
        })
      : [];
  }, [context, jsonSchema, alias]);

  const initialValue = useMemo(() => {
    return isArray(defaultValue)
      ? map(defaultValue, (v) => JSON.stringify(v))
      : undefined;
  }, [defaultValue]);

  const handleChange = useHandle((value: CheckboxValue[]) => {
    onChange((previous) =>
      mergeEnumSelection(isArray(previous) ? previous : [], value, options),
    );
  });

  return (
    <div
      ref={bindControls}
      id={inputId}
      aria-labelledby={titleId}
      aria-label={fieldName}
      role="group"
      aria-invalid={misfit || undefined}
      style={{ display: 'flex', flexDirection: 'row', gap: 8 }}
    >
      <Checkbox.Group
        disabled={disabled || readOnly}
        defaultValue={initialValue}
        onChange={handleChange}
      >
        {map(options, (option, index) => (
          <Checkbox
            key={option.value}
            id={getInputId(index)}
            value={option.value}
            style={{
              '--icon-size': '24px',
              '--font-size': '20px',
              '--gap': '6px',
            }}
          >
            {option.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};

export const FieldInputStringCheckboxDefinition = {
  Component: FieldInputStringCheckbox,
  test: isCheckboxGroupInput,
} satisfies FieldInputDefinition;
