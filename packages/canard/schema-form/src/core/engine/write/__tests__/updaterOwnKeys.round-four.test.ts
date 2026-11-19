import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { writeFieldNodeInput } from '../../../surface/utils/binding/writeFieldNodeInput';

it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
  'batch and input updaters see only own data for %s',
  (name) => {
    const run = (mode: 'direct' | 'batch' | 'input') => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            team: {
              type: 'object',
              properties: {
                name: { type: 'string', default: 'n' },
                [name]: { type: 'string' },
              },
            },
          },
        },
        defaultValue: { team: {} },
      });
      const target = root.find('/team/' + name)!;
      const seen: unknown[] = [];
      const update = (previous: unknown) => {
        seen.push(previous);
        return String(previous ?? '') + 'x';
      };
      if (mode === 'batch') root.batch(() => target.setValue(update));
      else if (mode === 'input') writeFieldNodeInput(target, update);
      else target.setValue(update);
      return { seen, value: root.value };
    };
    expect(run('batch')).toEqual(run('direct'));
    expect(run('input')).toEqual(run('direct'));
  },
);
