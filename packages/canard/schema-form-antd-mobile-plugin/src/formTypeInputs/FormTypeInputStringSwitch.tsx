import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringSwitchSchema = StringSchema & {
  enum?: [string | null, string | null];
};

interface FormTypeInputStringSwitchProps
  extends FormTypeInputPropsWithSchema<
    string | null,
    StringSwitchSchema,
    {
      switchLabels?: { [label: string]: ReactNode };
    }
  > {
  alias?: { [label: string]: ReactNode };
}

const FormTypeInputStringSwitch = ({
  path,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  alias,
}: FormTypeInputStringSwitchProps) => {
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
    <Switch
      key={path}
      disabled={disabled}
      checked={value === checked}
      checkedText={checkedLabel}
      uncheckedText={uncheckedLabel}
      onChange={handleChange}
    />
  );
};

export const FormTypeInputStringSwitchDefinition = {
  Component: FormTypeInputStringSwitch,
  test: ({ type, formType, jsonSchema }) =>
    type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,
} satisfies FormTypeInputDefinition;
