import type { FormScenario } from '../types';

/** A budget stop restores caller source B after an array default created an item. */
export const sourceBStructureScenario = {
  name: 'array.source-b-structure',
  description: 'TEST-018 NODE-051 WRITE-099: Source-B rollback removes an automatically created array item.',
  schema: { type: 'object', properties: {
    flag: { type: 'boolean' },
    a: { type: ['string', 'boolean'] },
    items: { type: 'array', default: ['filled'], controls: { active: '../flag' },
      items: { type: 'string' } },
  }, allOf: [
    { controls: { active: './a === "0"' }, properties: { a: { type: 'boolean' } } },
    { controls: { active: './a !== "0"' }, properties: { a: { type: 'string' } } },
  ] },
  initialValue: { flag: false, a: 'ready' },
  steps: [
    { action: 'setValue', path: '', value: { flag: true, a: 0 }, expect: {
      diagnostics: { status: 'degraded', cause: 'budget' },
      shape: { '/items/0': 'absent' },
      values: { '/items': [] }, extras: { '/items': undefined },
      outputValue: { flag: true, a: 0 },
    } },
  ],
} satisfies FormScenario;
