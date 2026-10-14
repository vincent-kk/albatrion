import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd';
import type { SwitchSize } from 'antd/es/switch';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
} from '@canard/schema-form';

type BooleanSwitchSchema = BooleanSchema;

interface FieldInputBooleanSwitchProps
  extends FieldInputPropsWithSchema<
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
  /** Labels for checked states, from `presentation.FieldInputProps.alias`. */
  alias?: { checked?: ReactNode; unchecked?: ReactNode };
}

const FieldInputBooleanSwitch = ({
  path,
  disabled,
  value,
  onChange,
  context,
  size,
  alias,
}: FieldInputBooleanSwitchProps) => {
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
export const FieldInputBooleanSwitchDefinition = {
  Component: FieldInputBooleanSwitch,
  test: ({ type, inputType }) => type === 'boolean' && inputType === 'switch',
} satisfies FieldInputDefinition;
