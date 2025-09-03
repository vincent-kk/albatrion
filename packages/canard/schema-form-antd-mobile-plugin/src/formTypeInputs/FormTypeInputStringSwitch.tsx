import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringSwitchSchema = StringSchema & {
  enum?: [string, string];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
};

const FormTypeInputStringSwitch = ({
  path,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  string,
  StringSwitchSchema,
  {
    switchLabels?: { [label: string]: ReactNode };
  }
>) => {
  const [checked, unchecked] = useMemo(() => {
    const [checked, unchecked] = jsonSchema.enum || [];
    return [checked || 'on', unchecked || 'off'];
  }, [jsonSchema]);

  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const alias = context.switchLabels || jsonSchema.options?.alias || {};
    return [alias[checked] || checked, alias[unchecked] || unchecked];
  }, [checked, unchecked, context, jsonSchema]);

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
