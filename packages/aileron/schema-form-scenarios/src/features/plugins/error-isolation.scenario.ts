import type { FormScenario } from '../../types';

/** A field drawn by an input that throws on one value, beside an ordinary sibling. */
const isolationSchema = {
  type: 'object',
  properties: { broken: { type: 'string' }, sibling: { type: 'string' } },
};

/** Value that makes the consumer's input for /broken throw while rendering. */
export const isolationTrigger = 'boom';

/** A throwing input falls back alone; the sibling keeps working and the failure reaches onError once. */
export const errorIsolationScenario: FormScenario = {
  name: 'plugins.error-isolation',
  description: 'GOAL-059 an injected component is isolated; ERROR-089 and ERROR-090 the field boundary around a mapped input catches its render failure, draws the fallback and reports RENDER_FAILED through onError once; the node keeps the written value and the sibling input still edits. The consumer maps /broken to an input that throws on isolationTrigger.',
  schema: isolationSchema,
  initialValue: { broken: 'ok', sibling: 'kept' },
  steps: [
    { action: 'batch', steps: [{ action: 'setValue', path: '/broken', value: 'boom' }], expect: {
      values: { '/broken': 'boom', '/sibling': 'kept' }, onErrorCodes: ['SCHEMA_FORM_ERROR.RENDER_FAILED'],
    } },
    { action: 'setValue', path: '/sibling', value: 'typed', expect: {
      values: { '/sibling': 'typed' }, outputValue: { broken: 'boom', sibling: 'typed' }, onErrorCodes: [],
    } },
  ],
};
