import { useMemo } from 'react';

import { Switch } from 'antd';
import type { SwitchSize } from 'antd/es/switch';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
  StringSchema,
} from '@lumy-pack/schema-form';

interface StringSwitchSchema extends StringSchema {
  enum?: [string, string];
  options?: {
    alias?: Dictionary<string>;
  };
}

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
  { switchSize?: SwitchSize }
>) => {
  const [checked, unchecked] = useMemo(() => {
    const [checked, unchecked] = jsonSchema.enum || [];
    return [checked || 'on', unchecked || 'off'];
  }, [jsonSchema]);

  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const alias = jsonSchema.options?.alias || {};
    return [alias[checked] || checked, alias[unchecked] || unchecked];
  }, [checked, unchecked, jsonSchema]);

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
      size={context.switchSize}
    />
  );
};

export const FormTypeInputStringSwitchDefinition = {
  Component: FormTypeInputStringSwitch,
  test: ({ type, formType, jsonSchema }) =>
    type === 'string' && formType === 'switch' && jsonSchema.enum?.length === 2,
} satisfies FormTypeInputDefinition;
