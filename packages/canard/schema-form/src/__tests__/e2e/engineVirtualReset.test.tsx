import { expect, it } from 'vitest';

import { mountEngineForm } from './fixtures/mountEngineForm';

const schema = {
  type: 'object',
  properties: {
    start: { type: 'string' },
    end: { type: 'string' },
    note: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['start', 'end'] } } },
} as const;
const load = () =>
  mountEngineForm({
    jsonSchema: schema,
    defaultValue: { start: 'a', end: 'b', note: 'n' },
  });

it.each(['unedited', 'edited'] as const)(
  'virtual reset equals resetting its stored fields: %s',
  (state) => {
    const run = (virtual: boolean) => {
      const root = load();
      if (state === 'edited') root.find('/period')!.setValue(['c', 'd']);
      if (virtual) root.find('/period')!.resetSubtree();
      else {
        root.find('/start')!.resetSubtree();
        root.find('/end')!.resetSubtree();
      }
      return root.value;
    };
    expect(run(true)).toEqual(run(false));
  },
);

it.each(['virtual-before-field', 'field-before-virtual'] as const)(
  'batch reset agrees with sequential storage resolution: %s',
  (operation) => {
    const run = (batch: boolean) => {
      const root = load();
      const calls = () => {
        if (operation === 'virtual-before-field') {
          root.find('/period')!.setValue(['c', 'd']);
          root.find('/start')!.resetSubtree();
        } else {
          root.find('/start')!.setValue('c');
          root.find('/period')!.resetSubtree();
        }
      };
      if (batch) root.batch(calls);
      else calls();
      return root.value;
    };
    expect(run(true)).toEqual(run(false));
  },
);

it.each(['/start', '/period/start', '/period/../start', '/./start'])(
  'a field alias reads and writes the same storage: %s',
  (path) => {
    const root = load(),
      control = load();
    const field = root.find(path);
    expect(field?.path).toBe('/start');
    field?.setValue('edited');
    control.find('/start')!.setValue('edited');
    expect(root.value).toEqual(control.value);
    field?.resetSubtree();
    control.find('/start')!.resetSubtree();
    expect(root.value).toEqual(control.value);
  },
);
