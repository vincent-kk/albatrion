import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { getOwnLabel } from './utils/enum/getOwnLabel';

type StringSwitchSchema = StringSchema & {
  enum?: [string | null, string | null];
};

interface FieldInputStringSwitchProps
  extends FieldInputPropsWithSchema<
    string | null,
    StringSwitchSchema,
    {
      switchLabels?: { [label: string]: ReactNode };
    }
  > {
  alias?: { [label: string]: ReactNode };
}

const FieldInputStringSwitch = ({
  labelId,
  jsonSchema,
  disabled,
  readOnly,
  value,
  onChange,
  context,
  alias,
  misfit,
  className,
  style,
}: FieldInputStringSwitchProps) => {
  const [checked, unchecked] = useMemo(() => {
    const [checked, unchecked] = jsonSchema.enum || [];
    return [
      checked !== undefined ? checked : 'on',
      unchecked !== undefined ? unchecked : 'off',
    ];
  }, [jsonSchema]);

  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const labels = context.switchLabels || alias || {};
    return [
      getOwnLabel(labels, String(checked)) || checked,
      getOwnLabel(labels, String(unchecked)) || unchecked,
    ];
  }, [checked, unchecked, context, alias]);

  const handleChange = useHandle((input: boolean) => {
    onChange(input ? checked : unchecked);
  });

  return (
    <Switch
      className={className}
      style={style}
      aria-invalid={misfit || undefined}
      aria-labelledby={labelId}
      disabled={disabled || readOnly}
      checked={value === checked}
      checkedText={checkedLabel}
      uncheckedText={uncheckedLabel}
      onChange={handleChange}
    />
  );
};

export const FieldInputStringSwitchDefinition = {
  Component: FieldInputStringSwitch,
  controlled: true,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    inputType === 'switch' &&
    jsonSchema.enum?.length === 2,
} satisfies FieldInputDefinition;
