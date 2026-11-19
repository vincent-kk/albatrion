import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { isArrayNode } from '../../surface';
import { ValidationMode } from '../types/state';

it('virtual item groups follow 1000 generated array mutation histories', () => {
  for (let seed = 1; seed <= 1000; seed++) {
    let random = seed;
    const next = (limit: number) => {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      return (random >>> 8) % limit;
    };
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          outside: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                on: { type: 'boolean' },
                a: { type: 'string' },
                b: { type: 'string', controls: { active: '../on === true' } },
              },
              options: { virtual: { group: { fields: ['a', 'b'] } } },
            },
          },
        },
      },
      defaultValue: { outside: 'outside', rows: [] },
      validationMode: ValidationMode.None,
      errorReporter: { hasConsumer: () => true, report: () => {} },
    });
    const outside = root.find('/outside')!;
    outside.setState({ touched: true });
    outside.setExternalErrors([{ dataPath: '/outside', keyword: 'outside' }]);
    const outsideState = outside.state,
      outsideErrors = outside.errors;
    const rows = root.find('/rows');
    if (!isArrayNode(rows)) throw new Error('rows expected');
    const model: {
      on: boolean;
      a?: string;
      b?: string;
      loadA?: string;
      loadB?: string;
    }[] = [];
    for (let step = 0; step < 16; step++) {
      const operation = next(7),
        index = model.length ? next(model.length) : 0;
      if (operation === 0 || !model.length) {
        const item = { on: !!next(2), a: `a${step}`, b: `b${step}` };
        const at = next(model.length + 1);
        rows.insert(at, item);
        model.splice(at, 0, { ...item, loadA: item.a, loadB: item.b });
      } else if (operation === 1) {
        const old = root.find(`/rows/${index}/group`)!;
        rows.remove(index);
        model.splice(index, 1);
        old.setValue(['detached', 'detached']);
        old.resetSubtree();
      } else if (operation === 2) {
        model[index].on = !model[index].on;
        root.find(`/rows/${index}/on`)!.setValue(model[index].on);
      } else if (operation === 3) {
        const tuple = [`edit${step}`, next(2) ? `tail${step}` : undefined];
        root.find(`/rows/${index}/group`)!.setValue(tuple);
        model[index].a = tuple[0];
        if (model[index].on || tuple[1] !== undefined)
          model[index].b = tuple[1];
      } else if (operation === 4) {
        root.find(`/rows/${index}/group`)!.resetSubtree();
        model[index].a = model[index].loadA;
        model[index].b = model[index].loadB;
      } else if (operation === 5) {
        const groups = model.map(
          (_, slot) => root.find(`/rows/${slot}/group`)!,
        );
        rows.clear();
        model.length = 0;
        for (const group of groups) group.resetSubtree();
      }
      const expected = model.map((item) => ({
        on: item.on,
        ...(item.a === undefined ? {} : { a: item.a }),
        ...(item.on && item.b !== undefined ? { b: item.b } : {}),
      }));
      expect(root.value, `seed=${seed} step=${step} op=${operation}`).toEqual({
        outside: 'outside',
        ...(model.length ? { rows: expected } : {}),
      });
      expect(root.find('/outside')).toBe(outside);
      expect(outside.state).toEqual(outsideState);
      expect(outside.errors).toEqual(outsideErrors);
      for (let slot = 0; slot < model.length; slot++) {
        expect(
          root
            .find(`/rows/${slot}/group`)!
            .children?.map((child) => child.path) ?? [],
          `seed=${seed} slot=${slot} children`,
        ).toEqual([
          `/rows/${slot}/a`,
          ...(model[slot].on ? [`/rows/${slot}/b`] : []),
        ]);
        expect(
          root.find(`/rows/${slot}/group`)!.value,
          `seed=${seed} slot=${slot}`,
        ).toEqual([model[slot].a, model[slot].on ? model[slot].b : undefined]);
      }
    }
  }
}, 120_000);
