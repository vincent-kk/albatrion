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
  alias?: { checked?: ReactNode; unchecked?: ReactNode };
}

const FormTypeInputBooleanSwitch = ({
  path,
  disabled,
  value,
  onChange,
  context,
  size,
  alias,
}: FormTypeInputBooleanSwitchProps) => {
  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const labels = context?.checkboxLabels || alias || {};
    return [labels.checked, labels.unchecked];
  }, [context, alias]);

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
