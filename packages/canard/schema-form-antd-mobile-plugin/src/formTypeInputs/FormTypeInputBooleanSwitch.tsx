import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FormTypeInputDefinition,
  FormTypeInputPropsWithSchema,
} from '@canard/schema-form';

interface FormTypeInputBooleanSwitchProps
  extends FormTypeInputPropsWithSchema<
    boolean | null,
    BooleanSchema,
    {
      checkboxLabels?: {
        checked?: ReactNode;
        unchecked?: ReactNode;
      };
    }
  > {
  alias?: { checked?: ReactNode; unchecked?: ReactNode };
}

const FormTypeInputBooleanSwitch = ({
  path,
  disabled,
  value,
  onChange,
  context,
  alias,
}: FormTypeInputBooleanSwitchProps) => {
  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const labels = context?.checkboxLabels || alias || {};
    return [labels.checked, labels.unchecked];
  }, [context, alias]);

  const handleChange = useHandle(onChange);

  return (
    <Switch
      key={path}
      disabled={disabled}
      checked={value ?? undefined}
      checkedText={checkedLabel}
      uncheckedText={uncheckedLabel}
      onChange={handleChange}
    />
  );
};
export const FormTypeInputBooleanSwitchDefinition = {
  Component: FormTypeInputBooleanSwitch,
  test: ({ type, formType }) => type === 'boolean' && formType === 'switch',
} satisfies FormTypeInputDefinition;
