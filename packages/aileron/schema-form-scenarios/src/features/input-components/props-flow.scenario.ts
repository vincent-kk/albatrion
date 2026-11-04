import type { FormScenario } from '../../types';

/** Presentation props and control states that reach the built-in inputs as DOM attributes. */
const propsSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', presentation: { FieldInputProps: { placeholder: 'Your name', className: 'wide-name' } } },
    locked: { type: 'string', controls: { readOnly: true } },
    off: { type: 'string', controls: { disabled: true } },
  },
};

/** Schema presentation props and control states flow to the rendered input. */
export const propsFlowScenario: FormScenario = {
  name: 'input-components.props-flow',
  description: 'presentation.FieldInputProps reaches the input as props (placeholder, className); controls.readOnly and controls.disabled reach it as readOnly and disabled (CONTROLS-023), and the node rejects screen writes while they hold (LANDING-168). Attributes come from propsFlowAttributes.',
  schema: propsSchema,
  initialValue: { name: 'Kim', locked: 'L', off: 'O' },
  steps: [{ action: 'batch', steps: [], expect: {
    states: { '/locked': { isReadOnly: true }, '/off': { isDisabled: true } }, values: { '/name': 'Kim', '/locked': 'L', '/off': 'O' },
  } }],
};

/** DOM attributes expected on each rendered input. */
export const propsFlowAttributes: Readonly<Record<string, Readonly<{ placeholder?: string; className?: string; readOnly?: boolean; disabled?: boolean }>>> = {
  '/name': { placeholder: 'Your name', className: 'wide-name', readOnly: false, disabled: false },
  '/locked': { readOnly: true, disabled: false },
  '/off': { disabled: true },
};
