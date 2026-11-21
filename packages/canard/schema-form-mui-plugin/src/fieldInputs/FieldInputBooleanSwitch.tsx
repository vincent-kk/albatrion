import { type CSSProperties, type ReactNode, useMemo } from 'react';

import { FormControlLabel, Switch } from '@mui/material';

import { useHandle } from '@winglet/react-utils/hook';

import type {
  BooleanSchema,
  FieldInputDefinition,
  FieldInputPropsWithSchema,
} from '@canard/schema-form';

import type { MuiContext } from '../type';
import { resolveFieldLabel } from '../utils/resolveFieldLabel';
import { useMeaningfulLabelId } from '../utils/useMeaningfulLabelId';
import { useFieldLabelAssociation } from './hooks/useFieldLabelAssociation';

/** Visually hide the native fallback without excluding it from name calculation. */
const HIDDEN_LABEL_STYLE: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  clipPath: 'inset(50%)',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
};

type BooleanSwitchJSONSchema = BooleanSchema & {};

interface FieldInputBooleanSwitchProps
  extends FieldInputPropsWithSchema<
      boolean | null,
      BooleanSwitchJSONSchema,
      MuiContext
    >,
    MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
  /** State labels; context.checkboxLabels takes priority. */
  alias?: { checked?: ReactNode; unchecked?: ReactNode };
}

const FieldInputBooleanSwitch = ({
  inputId,
  node,
  labelId: fieldTitleId,
  name,
  required,
  disabled,
  value,
  onChange,
  context,
  jsonSchema,
  label: labelProp,
  size: sizeProp = 'medium',
  hideLabel,
  alias,
  misfit,
}: FieldInputBooleanSwitchProps) => {
  const fieldName = useFieldLabelAssociation(
    inputId,
    fieldTitleId,
    jsonSchema,
    name,
  );
  const titleId = useMeaningfulLabelId(fieldTitleId, !node.parentNode);
  const handleChange = useHandle(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.checked);
    },
  );

  const [label, size] = useMemo(() => {
    if (hideLabel) return [undefined, sizeProp || context.size];
    return [
      resolveFieldLabel(jsonSchema, name, labelProp),
      sizeProp || context.size,
    ];
  }, [context, jsonSchema, labelProp, name, sizeProp, hideLabel]);

  const labels = context.checkboxLabels || alias;
  const stateLabel = value === true ? labels?.checked : labels?.unchecked;

  return (
    <>
      <FormControlLabel
        label={
          stateLabel === undefined ? (
            label
          ) : (
            <>
              {label}
              <span aria-hidden="true"> {stateLabel}</span>
            </>
          )
        }
        htmlFor={inputId}
        required={required}
        disabled={disabled}
        labelPlacement="start"
        control={
          <Switch
            id={inputId}
            name={name}
            checked={value === true}
            onChange={handleChange}
            disabled={disabled}
            size={size}
            slotProps={{
              input: {
                'aria-labelledby': titleId,
                'aria-label': node.parentNode ? fieldName : undefined,
                role: 'switch',
                'aria-invalid': misfit || undefined,
              },
            }}
          />
        }
      />
      {!node.parentNode && (label == null || label === '') && fieldName && (
        <label
          htmlFor={inputId}
          style={HIDDEN_LABEL_STYLE}
          data-field-name-fallback=""
        >
          {fieldName}
        </label>
      )}
    </>
  );
};

export const FieldInputBooleanSwitchDefinition = {
  Component: FieldInputBooleanSwitch,
  controlled: true,
  test: ({ type, inputType }) => type === 'boolean' && inputType === 'switch',
} satisfies FieldInputDefinition;
