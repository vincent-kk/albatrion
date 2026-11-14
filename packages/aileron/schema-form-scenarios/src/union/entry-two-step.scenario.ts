import type { FormScenario } from '../types';

/** WRITE-098 uses the final flag branch when interpreting original zero. */
export const entryTwoStepScenario = {
  name: 'union.entry-two-step',
  schema: { type: 'object', properties: {
    kind: { type: 'string' }, a: { type: ['string', 'boolean'] },
  }, allOf: [
    { controls: { active: './kind === "flag"' }, properties: {
      a: { type: 'boolean' },
    } },
    { controls: { active: './kind === "text"' }, properties: {
      a: { type: 'string' },
    } },
  ] },
  initialValue: { kind: 'flag', a: 0 },
  steps: [
    { action: 'reset', expect: { values: { '/a': false },
      outputValue: { kind: 'flag', a: false } } },
    { action: 'setValue', path: '', value: { kind: 'text', a: 'old' },
      expect: { outputValue: { kind: 'text', a: 'old' } } },
    { action: 'setValue', path: '', value: { kind: 'flag', a: 0 },
      expect: { values: { '/a': false }, outputValue: { kind: 'flag', a: false } } },
  ],
} satisfies FormScenario;
