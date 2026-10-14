import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
} from '@canard/schema-form';

interface FieldInputBooleanSwitchProps
  extends FieldInputPropsWithSchema<
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

const FieldInputBooleanSwitch = ({
  path,
  disabled,
  value,
  onChange,
  context,
  alias,
}: FieldInputBooleanSwitchProps) => {
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
export const FieldInputBooleanSwitchDefinition = {
  Component: FieldInputBooleanSwitch,
  test: ({ type, inputType }) => type === 'boolean' && inputType === 'switch',
} satisfies FieldInputDefinition;
