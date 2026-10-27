import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';

it.each(['clear', 'pop'])(
  'releases pending source keys when metadata-only exits are pruned (%s)',
  (action) => {
    const { root, runtime } = makeFieldNodeTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              held: {
                type: 'string',
                controls: { active: '#/open', unsetOnInactive: true },
              },
            },
          },
        },
      },
    });
    root.setValue({ open: true, list: [{ held: 'a' }, { held: 'b' }] });
    root.find('/open')!.setValue(false);
    const list = root.find('/list')!;
    if (list.type !== 'array') throw new Error('Expected array');
    if (action === 'clear') list.clear();
    else list.pop();
    const pending: unknown = Reflect.get(runtime, 'inactiveValueChanges');
    const metadata: unknown = Reflect.get(runtime, 'latentRawMetadata');
    const latent: unknown = Reflect.get(runtime, 'latentRaw');
    if (
      !(pending instanceof Set) ||
      !(metadata instanceof Map) ||
      !(latent instanceof Map)
    )
      throw new Error('Missing source stores');
    expect(
      [...pending].filter((key) => !metadata.has(key) && !latent.has(key)),
    ).toEqual([]);
  },
);
