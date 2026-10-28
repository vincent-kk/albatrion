import { describe, expect, it } from 'vitest';

import {
  type BlueprintSchema,
  PathKeyedSet,
  blueprint,
} from '@/schema-form/core/engine';

import { fieldNodeFactory } from '../utils/fieldNodeFactory';

const makeTree = (schema: BlueprintSchema) =>
  fieldNodeFactory(blueprint(schema), {
    diagnostics: { status: 'stable' },
    loadSnapshot: undefined,

    misfitPaths: new PathKeyedSet(),
  });

describe('B2-P3 public latent and assembly contracts', () => {
  it('retains escaped field values across inactivity and ignores stale writes after reentry', () => {
    const name = 'quoted"/tilde~/\n/😀/\ud800';
    const path = '/' + name.replace(/~/g, '~0').replace(/\//g, '~1');
    const root = makeTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        [name]: {
          type: 'string',
          controls: { active: '../flag', unsetOnInactive: false },
        },
      },
    });
    root.setValue({ flag: true, [name]: 'edited' });
    const old = root.find(path)!;
    root.find('/flag')!.setValue(false);
    expect(root.find(path)).toBeNull();
    expect(root.inactiveValues).toEqual([{ path, value: 'edited' }]);
    root.find('/flag')!.setValue(true);
    expect(root.find(path)).not.toBe(old);
    expect(root.find(path)!.value).toBe('edited');
    expect(root.inactiveValues).toEqual([]);
    old.setValue('stale write');
    expect(root.find(path)!.value).toBe('edited');
  });

  it('preserves preferred, declared and extra order with sparse active children', () => {
    const root = makeTree({
      type: 'object',
      options: { propertyOrder: ['tail', 'tail'] },
      properties: {
        a: { type: 'string' },
        ...Object.fromEntries(
          Array.from({ length: 240 }, (_, index) => [
            'gap_' + index,
            { type: 'string', controls: { active: false } },
          ]),
        ),
        b: { type: 'number' },
        blocked: { type: 'string' },
      },
    });
    root.setValue({ extra: 10, b: 2, a: 'A', tail: 9, blocked: undefined });
    expect(root.value).toEqual({ tail: 9, a: 'A', b: 2, extra: 10 });
    expect(Object.keys(root.value as object)).toEqual([
      'tail',
      'a',
      'b',
      'extra',
    ]);
    expect(Object.keys(root.outputValue as object)).toEqual([
      'tail',
      'a',
      'b',
      'extra',
    ]);
    root.find('/a')!.setValue('changed');
    expect(root.value).toEqual({ tail: 9, a: 'changed', b: 2, extra: 10 });
    expect(Object.keys(root.value as object)).toEqual([
      'tail',
      'a',
      'b',
      'extra',
    ]);
    expect(root.find('/gap_120')).toBeNull();
  });
});
