import { expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { isArrayNode, reloadFieldNodeForm } from '@/schema-form/core/surface';

it.each(['subtree', 'form'] as const)(
  'preserves a rekeyed old reference address through %s reset',
  (reset) => {
    const { root, runtime } = makeFieldNodeTree({
      type: 'object',
      properties: {
        sibling: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              flag: { type: 'boolean' },
              gated: { type: 'string', controls: { active: '../flag' } },
            },
          },
        },
      },
    });
    root.setValue({
      sibling: 'a',
      items: [
        { flag: true, gated: 'first' },
        { flag: true, gated: 'second' },
      ],
    });
    const reference = root.find('/items/1/gated')!;
    root.find('/items/1/flag')!.setValue(false);
    const items = root.find('/items');
    if (!items || !isArrayNode(items)) throw new Error('Expected an array');
    items.remove(0);
    if (reset === 'subtree') root.find('/sibling')!.resetSubtree();
    else reloadFieldNodeForm(root, { sibling: 'b', items: [{ flag: false }] });
    reference.setValue('x');
    expect(reference.path).toBe('/items/1/gated');
    const latent = Reflect.get(runtime, 'latentRaw');
    expect(latent.get(JSON.stringify(['/items/0/gated', 'string']))).toBe('x');
    expect(
      latent.get(JSON.stringify(['/items/1/gated', 'string'])),
    ).toBeUndefined();
    root.find('/items/0/flag')!.setValue(true);
    expect(root.find('/items/0/gated')!.value).toBe('x');
  },
);
