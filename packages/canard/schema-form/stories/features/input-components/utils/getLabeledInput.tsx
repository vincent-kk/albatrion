import type { ComponentType } from 'react';

import type { FormTypeInputProps } from '../../../../src';

const inputs = new Map<string, ComponentType<FormTypeInputProps>>();

/**
 * Return one stable text input per label that marks itself with data-winner, so a play can read which input won.
 * @param label - Definition label from the scenario data.
 * @returns The same component for the same label on every call, keeping definition identity stable across renders.
 */
export function getLabeledInput(label: string): ComponentType<FormTypeInputProps> {
  let input = inputs.get(label);
  if (!input) {
    input = ({ path, value, onChange, readOnly, disabled }: FormTypeInputProps) => (
      <input id={path} data-winner={label} defaultValue={typeof value === 'string' ? value : ''} readOnly={readOnly} disabled={disabled}
        onChange={(event) => onChange(event.target.value)} />
    );
    input.displayName = `LabeledInput(${label})`;
    inputs.set(label, input);
  }
  return input;
}
