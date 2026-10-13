import { pluginFormPlan } from '@aileron/schema-form-scenarios';
import { useState } from 'react';

import type { FormTypeInputProps } from '../../../src';

/**
 * Text input that throws while rendering on the CX-06 trigger value.
 * @param props - FormTypeInput props of the mapped node.
 * @returns The input; throws on pluginFormPlan.trigger so the field boundary catches it.
 */
export const ThrowOnTriggerInput = ({ path, value, onChange }: FormTypeInputProps<string>) => {
  if (value === pluginFormPlan.trigger) throw new Error(`input at ${path} threw on ${pluginFormPlan.trigger}`);
  return <input id={path} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
};

/**
 * Multi-file input for presentation.formType "composite.files": it attaches the files and stores their names.
 * @param props - FormTypeInput props.
 * @returns A native file input.
 */
export const MultipleFileInput = ({ path, onChange, onFileAttach }: FormTypeInputProps) => <input id={path} type="file" multiple onChange={(event) => {
  const files = Array.from(event.target.files ?? []);
  onFileAttach(files);
  onChange(files.map((file) => file.name));
}} />;

/**
 * Thousands-separator amount input for CX-04: it shows the grouped digits and writes the number, keeping its own draft.
 * EVENT-003 the caret after reformatting is this component's job; it puts the caret at the end, which the story does not assert.
 * @param props - FormTypeInput props of a number node.
 * @returns A text input showing grouped digits.
 */
export const FormattedAmountInput = ({ path, value, onChange }: FormTypeInputProps<number>) => {
  const format = (amount: number | undefined) => (amount === undefined ? '' : amount.toLocaleString('en-US'));
  const [draft, setDraft] = useState(() => format(value));
  return <input id={path} inputMode="numeric" value={draft} onChange={(event) => {
    const digits = event.target.value.replace(/[^0-9]/g, '');
    const next = digits ? Number(digits) : undefined;
    setDraft(format(next));
    onChange(next);
  }} />;
};
