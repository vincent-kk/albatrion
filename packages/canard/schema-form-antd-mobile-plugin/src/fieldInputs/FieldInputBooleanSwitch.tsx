import { type ReactNode, useMemo } from 'react';

import { Switch } from 'antd-mobile';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
} from '@canard/schema-form';

import { isBooleanSwitchInput } from '../utils/inputs/isBooleanSwitchInput';
import { useFieldNameFallback } from '../utils/useFieldNameFallback';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { SwitchKeyboardControl } from './components/SwitchKeyboardControl';

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
  inputId,
  jsonSchema,
  name,
  disabled,
  value,
  onChange,
  context,
  alias,
  misfit,
  labelId: labelledBy,
}: FieldInputBooleanSwitchProps) => {
  const titleId = useMeaningfulLabelId(labelledBy);
  const fieldName = useFieldNameFallback(jsonSchema, name);
  const [checkedLabel, uncheckedLabel] = useMemo(() => {
    const labels = context?.checkboxLabels || alias || {};
    return [labels.checked, labels.unchecked];
  }, [context, alias]);

  const handleChange = useHandle(onChange);

  return (
    <SwitchKeyboardControl id={inputId} name={name} disabled={disabled}>
      <Switch
        aria-labelledby={titleId}
        aria-label={fieldName}
        data-focus-target
        tabIndex={disabled ? undefined : 0}
        aria-invalid={misfit || undefined}
        key={inputId}
        disabled={disabled}
        checked={value === true}
        checkedText={checkedLabel}
        uncheckedText={uncheckedLabel}
        onChange={handleChange}
      />
    </SwitchKeyboardControl>
  );
};
export const FieldInputBooleanSwitchDefinition = {
  Component: FieldInputBooleanSwitch,
  controlled: true,
  test: isBooleanSwitchInput,
} satisfies FieldInputDefinition;
