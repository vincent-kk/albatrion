import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd';
import type { SwitchSize } from 'antd/es/switch';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

type StringSwitchSchema = StringSchema & {
  enum?: [string | null, string | null];
  options?: {
    alias?: { [label: string]: ReactNode };
  };
};

interface FormTypeInputStringSwitchProps
  extends FormTypeInputPropsWithSchema<
    string | null,
    StringSwitchSchema,
    { switchSize?: SwitchSize; switchLabels?: { [label: string]: ReactNode } }
  > {
  size?: SwitchSize;
}

const FormTypeInputStringSwitch = ({
  path,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
}: FormTypeInputStringSwitchProps) => {
  const [checked, unchecked] = useMemo(() => {
    const [checked, unchecked] = jsonSchema.enum || [];
    return [
      checked !== undefined ? checked : 'on',
      unchecked !== undefined ? unchecked : 'off',
    ];
  }, [jsonSchema]);

  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const alias = context.switchLabels || jsonSchema.options?.alias || {};
    return [alias['' + checked] || checked, alias['' + unchecked] || unchecked];
  }, [checked, unchecked, context, jsonSchema]);

  const handleChange = useHandle((input: boolean) => {
    onChange(input ? checked : unchecked);
  });

  return (
    <Switch
      key={path}
      disabled={disabled}
      checked={value === checked}
      checkedChildren={checkedLabel}
      unCheckedChildren={uncheckedLabel}
      onChange={handleChange}
      size={size || context?.switchSize}
    />
  );
};

export const FormTypeInputStringSwitchDefinition = {
  Component: FormTypeInputStringSwitch,
  test: ({ type, formType, jsonSchema }) =>
    type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,
} satisfies FormTypeInputDefinition;
