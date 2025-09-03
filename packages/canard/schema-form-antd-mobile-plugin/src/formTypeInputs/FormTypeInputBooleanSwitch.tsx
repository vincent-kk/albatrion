import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

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

  const handleChange = useHandle(onChange);

  return (
    <Switch
      key={path}
      disabled={disabled}
      checked={value}
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
