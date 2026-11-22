import { describe, expect, it } from 'vitest';

import { attempt, build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    tags: { type: 'array', items: { type: 'string' }, options: { terminal: true } },
    s: { type: 'string' },
  },
} as const;

const verbs: Record<string, (tags: any, root: any) => unknown[]> = {
  'push, push, remove(0)': (tags) => [tags.push('x'), tags.push('y'), tags.remove(0)],
  'insert(0), pop, update(0)': (tags) => [tags.insert(0, 'z'), tags.pop(), tags.update(0, 'u')],
  'setValue then push': (tags) => [tags.setValue(['p']), tags.push('q')],
  'scalar write then clear then push': (tags, root) => [root.find('/s').setValue('w'), tags.clear(), tags.push('r')],
  'updater then remove(0)': (tags) => [tags.setValue((prev: any) => [...(prev ?? []), 'n']), tags.remove(0)],
};

describe('EQ10 array verbs on a terminal array: batch against sequential', () => {
  for (const [name, run] of Object.entries(verbs)) {
    it(`T ${name}`, () => {
      const go = (mode: 'sequential' | 'batch') => {
        const { root, changes } = build(schema, { tags: ['a', 'b'], s: 's' });
        changes.length = 0;
        const tags = root.find('/tags');
        let returns: unknown[] = [];
        const thrown = attempt(() =>
          mode === 'batch' ? root.batch(() => (returns = run(tags, root))) : (returns = run(tags, root)),
        );
        return {
          value: root.value,
          returns,
          thrown: thrown && String(thrown),
          lastChange: changes.at(-1),
        };
      };
      const sequential = go('sequential');
      const batched = go('batch');
      diag(`T ${name}`, { sequential, batched });
      expect({ ...batched, returns: batched.returns }).toEqual(sequential);
    });
  }
});
