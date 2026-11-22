import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form';

import { build, diag } from './probeHelpers';

const schema = {
  type: 'object',
  properties: {
    gate: { type: 'boolean', default: true },
    list: {
      type: 'array',
      items: { type: 'object', properties: { name: { type: 'string' } } },
    },
    extra: { type: 'string', controls: { active: '../gate === true' } },
  },
} as const;

const scenarios: Record<string, (root: any) => void> = {
  'touch an item then remove it': (root) => {
    root.find('/list/0/name').setState({ [FieldNodeState.Touched]: true });
    root.find('/list').remove(0);
  },
  'external error on an item then remove it': (root) => {
    const name = root.find('/list/0/name');
    name.setExternalErrors([{ dataPath: name.path, keyword: 'srv', message: 'm' }]);
    root.find('/list').remove(0);
  },
  'touch a gated field then turn its gate off': (root) => {
    root.find('/extra').setState({ [FieldNodeState.Touched]: true });
    root.find('/gate').setValue(false);
  },
  'external error on a gated field then turn its gate off': (root) => {
    const extra = root.find('/extra');
    extra.setExternalErrors([{ dataPath: extra.path, keyword: 'srv', message: 'm' }]);
    root.find('/gate').setValue(false);
  },
  'touch an item then clear the list by setValue': (root) => {
    root.find('/list/1/name').setState({ [FieldNodeState.Touched]: true });
    root.find('/list').setValue([]);
  },
};

describe('EQ10 global aggregates after nodes leave inside a batch', () => {
  for (const [name, run] of Object.entries(scenarios)) {
    it(`G ${name}`, () => {
      const go = (mode: 'sequential' | 'batch') => {
        const stateChanges: unknown[] = [];
        const { root } = build(
          schema,
          { gate: true, list: [{ name: 'a' }, { name: 'b' }], extra: 'x' },
          { onStateChange: (state: unknown) => stateChanges.push(state) },
        );
        stateChanges.length = 0;
        if (mode === 'batch') root.batch(() => run(root));
        else run(root);
        return {
          globalState: root.globalState,
          globalErrors: root.globalErrors.map((e: any) => `${e.dataPath}:${e.keyword}`),
          lastStateChange: stateChanges.at(-1),
        };
      };
      const sequential = go('sequential');
      const batched = go('batch');
      diag(`G ${name}`, { sequential, batched });
      expect(batched).toEqual(sequential);
    });
  }
});
