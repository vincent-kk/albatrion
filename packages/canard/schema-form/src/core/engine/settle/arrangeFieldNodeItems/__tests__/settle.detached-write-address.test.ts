import { expect, it, vi } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { isArrayNode } from '@/schema-form/core/surface';

it.each(['insert', 'replace'] as const)(
  'preserves a detached write address after %s without changing frozen reads or delivering',
  async (operation) => {
    const { root, runtime } = makeFieldNodeTree({
      type: 'object',
      properties: {
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
      items: [
        { flag: true, gated: 'first' },
        { flag: true, gated: 'second' },
        { flag: true, gated: 'third' },
      ],
    });
    const list = root.find('/items');
    const ref = root.find('/items/2/gated')!;
    if (!list || !isArrayNode(list)) throw new Error('Expected the array');
    root.find('/items/2/flag')!.setValue(false);
    let destination: string;
    if (operation === 'insert') {
      list.insert(0, { flag: true, gated: 'new' });
      destination = '/items/3';
    } else {
      list.remove(0);
      root.setValue({
        items: [{ flag: true, gated: 'second' }, { flag: false }],
      });
      const latent = Reflect.get(runtime, 'latentRaw');
      expect(latent.size).toBe(0);
      destination = '/items/1';
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    const revision = root.revision();
    const commit = Reflect.get(runtime, 'commitNumber');
    const delivered = vi.fn();
    const unsubscribe = root.subscribe(delivered);
    ref.setValue('x');
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();
    expect(delivered).not.toHaveBeenCalled();
    expect(root.revision()).toBe(revision);
    expect(Reflect.get(runtime, 'commitNumber')).toBe(commit);
    expect(ref.path).toBe('/items/2/gated');
    expect(ref.value).toBe('third');
    root.find(destination + '/flag')!.setValue(true);
    expect(root.find(destination + '/gated')!.value).toBe('x');
    expect(root.find('/items/0/gated')!.value).toBe(
      operation === 'insert' ? 'new' : 'second',
    );
  },
);
