import { describe, expect, it } from 'vitest';

import type { JSONSchema as AuthoredSchema } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

describe('a batched read interprets earlier caller writes under each static type (EVENT-061)', () => {
  const schema: AuthoredSchema = {
    type: 'object',
    properties: {
      n: { type: 'number' },
      box: { type: 'object', properties: { m: { type: 'number' } } },
    },
  };

  it('a child updater receives undefined after its ancestor omits the child in an overwrite', () => {
    const root = mountEngineForm({
      jsonSchema: schema,
      defaultValue: { box: { m: 1 } },
    });
    const box = root.find('/box')!;
    const seen: unknown[] = [];
    root.batch(() => {
      root.setValue({});
      box.setValue((value: unknown) => {
        seen.push(value);
        return { m: 2 };
      });
    });
    expect(seen).toEqual([undefined]);
    expect(root.value).toEqual({ box: { m: 2 } });
  });
});
