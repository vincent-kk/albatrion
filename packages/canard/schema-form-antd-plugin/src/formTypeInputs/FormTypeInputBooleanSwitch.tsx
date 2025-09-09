import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd';
import type { SwitchSize } from 'antd/es/switch';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

type BooleanSwitchSchema = BooleanSchema & {
  options?: {
    alias?: {
      checked?: ReactNode;
      unchecked?: ReactNode;
    };
  };
};

interface FormTypeInputBooleanSwitchProps
  extends FormTypeInputPropsWithSchema<
    boolean | null,
    BooleanSwitchSchema,
    {
      switchSize?: SwitchSize;
      checkboxLabels?: {
        checked?: ReactNode;
        unchecked?: ReactNode;
      };
    }
  > {
  size?: SwitchSize;
}

const FormTypeInputBooleanSwitch = ({
  path,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  size,
}: FormTypeInputBooleanSwitchProps) => {
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
      checked={value ?? undefined}
      checkedChildren={checkedLabel}
      unCheckedChildren={uncheckedLabel}
      onChange={handleChange}
      size={size || context?.switchSize}
    />
  );
};
export const FormTypeInputBooleanSwitchDefinition = {
  Component: FormTypeInputBooleanSwitch,
  test: ({ type, formType }) => type === 'boolean' && formType === 'switch',
} satisfies FormTypeInputDefinition;
