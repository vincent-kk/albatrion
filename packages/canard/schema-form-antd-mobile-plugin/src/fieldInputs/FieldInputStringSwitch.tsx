import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputPropsWithSchema,
  StringSchema,
} from '@canard/schema-form';

import { SwitchKeyboardControl } from './components/SwitchKeyboardControl';
import { getOwnLabel } from './utils/enum/getOwnLabel';

type StringSwitchSchema = StringSchema & {
  enum?: [string | null, string | null];
};

interface FieldInputStringSwitchProps
  extends FieldInputPropsWithSchema<
    string | null,
    StringSwitchSchema,
    {
      switchLabels?: { [label: string]: ReactNode };
    }
  > {
  alias?: { [label: string]: ReactNode };
}

const FieldInputStringSwitch = ({
  id,
  name,
  jsonSchema,
  disabled,
  value,
  onChange,
  context,
  alias,
  misfit,
  'aria-labelledby': labelledBy,
}: FieldInputStringSwitchProps) => {
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
      getOwnLabel(labels, '' + checked) || checked,
      getOwnLabel(labels, '' + unchecked) || unchecked,
    ];
  }, [checked, unchecked, context, alias]);

  const handleChange = useHandle((input: boolean) => {
    onChange(input ? checked : unchecked);
  });

  return (
    <SwitchKeyboardControl id={id} name={name} disabled={disabled}>
      <Switch
        aria-labelledby={labelledBy}
        data-focus-target
        tabIndex={disabled ? undefined : 0}
        aria-invalid={misfit || undefined}
        key={id}
        disabled={disabled}
        checked={value === checked}
        checkedText={checkedLabel}
        uncheckedText={uncheckedLabel}
        onChange={handleChange}
      />
    </SwitchKeyboardControl>
  );
};

export const FieldInputStringSwitchDefinition = {
  Component: FieldInputStringSwitch,
  controlled: true,
  test: ({ type, inputType, jsonSchema }) =>
    type === 'string' &&
    inputType === 'switch' &&
    jsonSchema.enum?.length === 2,
} satisfies FieldInputDefinition;
