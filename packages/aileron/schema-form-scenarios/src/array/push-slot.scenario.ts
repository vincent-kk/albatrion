import type { FormScenario } from '../types';

/** A pushed value owns its new snapshot slot while existing identity remains. */
export const pushSlotScenario = {
  name: 'array.push-slot',
  description: 'TEST-011 TEST-018 TEST-023 NODE-051 WRITE-099 26C-02: push retains the old item and snapshots its value.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a'],
  steps: [
    { action: 'push', path: '', value: 'x', expect: {
      result: 2, identity: { '/0': '/0' }, defaultValues: { '/0': 'a', '/1': 'x' },
      values: { '': ['a', 'x'] }, outputValue: ['a', 'x'],
    } },
    { action: 'setValue', path: '/1', value: 'edited', expect: {
      defaultValues: { '/1': 'x' }, outputValue: ['a', 'edited'],
    } },
    { action: 'resetSubtree', path: '/1', expect: { outputValue: ['a', 'x'] } },
  ],
} satisfies FormScenario;
