import type { FormScenario } from '../../types';

/** Two text fields addressed by handle commands. */
const commandSchema = {
  type: 'object',
  properties: { first: { type: 'string' }, second: { type: 'string' } },
};

/** Handle commands reach the input of the addressed node and never write values. */
export const handleCommandsScenario: FormScenario = {
  name: 'handle-layout.handle-commands',
  description: 'EVENT-063 focus, select, refresh and remount are node commands that write no value; the handle finds the node by path and does nothing when it is missing; EVENT-041 refresh is a narrow remount of the addressed input that keeps its node and value. Stages come from handleCommandStages.',
  schema: commandSchema,
  initialValue: { first: 'alpha', second: 'beta' },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/first': 'alpha', '/second': 'beta' } } }],
};

/** One handle command and what the screen shows afterwards. */
export interface HandleCommandStage {
  /** Command called on the handle. */
  readonly act: 'focus' | 'select' | 'refresh' | 'focusMissing';
  /** Path passed to the command. */
  readonly path: string;
  /** id of the focused element afterwards. */
  readonly activeId: string;
  /** Selected range of the focused input afterwards, or null when nothing is selected. */
  readonly selection: readonly [number, number] | null;
  /** Whether the input element at `path` was replaced by a new DOM element. */
  readonly replaced: boolean;
}

/** Commands applied in order to handleCommandsScenario; values never change. */
export const handleCommandStages: readonly HandleCommandStage[] = [
  { act: 'focus', path: '/second', activeId: '/second', selection: null, replaced: false },
  { act: 'select', path: '/first', activeId: '/first', selection: [0, 5], replaced: false },
  { act: 'refresh', path: '/second', activeId: '/first', selection: [0, 5], replaced: true },
  { act: 'focusMissing', path: '/missing', activeId: '/first', selection: [0, 5], replaced: false },
];
