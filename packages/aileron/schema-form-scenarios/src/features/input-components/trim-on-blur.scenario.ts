import type { FormScenario } from '../../types';

/** A trimmed field beside an untrimmed one. */
const trimSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', options: { trim: true } },
    raw: { type: 'string' },
  },
};

/** options.trim trims on blur only; typing keeps the spaces in the node until focus leaves. */
export const trimOnBlurScenario: FormScenario = {
  name: 'input-components.trim-on-blur',
  description: 'CONTROLS-004 and CONTROLS-005 options.trim trims the stored value on blur, not on every keystroke; CONTROLS-006 the string input finishes the input; a field without trim keeps its spaces. Stages come from trimStages.',
  schema: trimSchema,
  initialValue: {},
  steps: [{ action: 'batch', steps: [], expect: { shape: { '/name': 'present', '/raw': 'present' } } }],
};

/** One screen interaction and the node values afterwards. */
export interface TrimStage {
  /** Type into a field, or move focus away from it. */
  readonly act: 'type' | 'blur';
  /** Field the interaction targets. */
  readonly path: string;
  /** Text typed for type. */
  readonly text?: string;
  /** Node values afterwards. */
  readonly values: Readonly<Record<string, unknown>>;
}

/** Interactions applied in order to trimOnBlurScenario. */
export const trimStages: readonly TrimStage[] = [
  { act: 'type', path: '/name', text: '  kim  ', values: { '/name': '  kim  ' } },
  { act: 'blur', path: '/name', values: { '/name': 'kim' } },
  { act: 'type', path: '/raw', text: '  lee  ', values: { '/raw': '  lee  ' } },
  { act: 'blur', path: '/raw', values: { '/name': 'kim', '/raw': '  lee  ' } },
];
