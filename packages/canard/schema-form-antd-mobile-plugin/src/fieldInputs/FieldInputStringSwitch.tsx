import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

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
  path,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  alias,
  misfit,
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
      labels['' + checked] || checked,
      labels['' + unchecked] || unchecked,
    ];
  }, [checked, unchecked, context, alias]);

  const handleChange = useHandle((input: boolean) => {
    onChange(input ? checked : unchecked);
  });

  return (
    <>
      <Switch
        aria-invalid={misfit || undefined}
        key={path}
        disabled={disabled}
        checked={value === checked}
        checkedText={checkedLabel}
        uncheckedText={uncheckedLabel}
        onChange={handleChange}
      />
      {misfit && <span role="status">Invalid value</span>}
    </>
  );
};

export const FieldInputStringSwitchDefinition = {
  Component: FieldInputStringSwitch,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    inputType === 'switch' &&
    jsonSchema.enum?.length === 2,
} satisfies FieldInputDefinition;
