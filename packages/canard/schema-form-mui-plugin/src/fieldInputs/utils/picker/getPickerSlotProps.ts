import type { FieldInputProps } from '@canard/schema-form';

/**
 * Connect MUI's editable sections and hidden form input to distinct core addresses.
 * @param inputId - Core address of the editable sections.
 * @param labelId - External title address.
 * @param getInputId - Core resolver for the native input and inline caption.
 * @param hasLabel - Whether the picker renders its inline caption.
 * @param disabled - Effective picker lock.
 * @param focusRef - Optional core anchor for the editable sections.
 * @returns Text-field slots for the accessible picker DOM.
 */
export const getPickerSlotProps = (
  inputId: string,
  labelId: string,
  getInputId: FieldInputProps['getInputId'],
  hasLabel: boolean,
  disabled: boolean,
  focusRef: FieldInputProps['focusRef'],
) => {
  const inlineId = hasLabel ? getInputId('legend') : undefined;
  const labelledBy = inlineId ?? labelId;
  return {
    id: getInputId('native'),
    InputLabelProps: { id: inlineId },
    InputProps: {
      'aria-labelledby': labelledBy,
      slotProps: {
        input: {
          id: inputId,
          ref: disabled ? undefined : focusRef,
          role: 'group' as const,
          'aria-disabled': disabled || undefined,
          'aria-labelledby': labelledBy,
        },
      },
    },
  };
};
