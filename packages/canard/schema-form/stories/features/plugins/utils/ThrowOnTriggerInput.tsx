import { isolationTrigger } from '@aileron/schema-form-scenarios';

import type { FieldInputProps } from '../../../../src';

/**
 * Text input that throws while rendering when its value equals isolationTrigger.
 * @param props - FieldInput props of the mapped node.
 * @returns The input element; throws on the trigger value so the field boundary catches it.
 */
export const ThrowOnTriggerInput = ({ path, value, onChange }: FieldInputProps<string>) => {
  if (value === isolationTrigger) throw new Error(`input at ${path} threw on ${isolationTrigger}`);
  return <input id={path} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />;
};
