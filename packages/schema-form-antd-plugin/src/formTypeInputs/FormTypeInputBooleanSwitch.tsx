import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd';
import type { SwitchSize } from 'antd/es/switch';

import { useHandle } from '@lumy-pack/common-react';
import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@lumy-pack/schema-form';

interface BooleanSwitchSchema extends BooleanSchema {
  options?: {
    alias?: {
      checked?: ReactNode;
      unchecked?: ReactNode;
    };
  };
}

const FormTypeInputBooleanSwitch = ({
  path,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
}: FormTypeInputPropsWithSchema<
  boolean,
  BooleanSwitchSchema,
  {
    switchSize?: SwitchSize;
    checkboxLabels?: {
      checked?: ReactNode;
      unchecked?: ReactNode;
    };
  }
>) => {
  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const alias = context?.checkboxLabels || jsonSchema.options?.alias || {};
    return [alias.checked, alias.unchecked];
  }, [context, jsonSchema]);

  const handleChange = useHandle((input: boolean) => {
    onChange(input);
  });

  return (
    <Switch
      key={path}
      disabled={disabled}
      checked={value}
      checkedChildren={checkedLabel}
      unCheckedChildren={uncheckedLabel}
      onChange={handleChange}
      size={context.switchSize}
    />
  );
};
export const FormTypeInputBooleanSwitchDefinition = {
  Component: FormTypeInputBooleanSwitch,
  test: ({ type, formType }) => type === 'boolean' && formType === 'switch',
} satisfies FormTypeInputDefinition;
