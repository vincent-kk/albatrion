import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

it.each([
  ['plain', { y: 'new', held: 'h1' }],
  ['empty-string', { y: '', held: '' }],
  ['null', { y: null, held: null }],
  ['object', { y: { x: 'new' }, held: { x: 'h1' } }],
  ['array', { y: ['new'], held: ['h1'] }],
  ['empty-array', { y: [], held: [] }],
] as const)('named %s sources agree through live and inactive routing', (name, payload) => {
  const field: any = name.includes('array') ? { type: 'array', items: { type: 'string' } }
    : name === 'object' ? { type: 'object', properties: { x: { type: 'string' } } }
    : { type: 'string', nullable: true };
  const initial = name.includes('array') ? ['old'] : name === 'object' ? { x: 'old' } : 'old';
  const run = (route: 'direct' | 'parent' | 'virtual', batch: boolean) => {
    const pack = (value: any) => route === 'direct'
      ? { '../o/y': value.y, '../o/held': value.held, '../o/z': value.z }
      : route === 'parent' ? { '../o': value } : { '../group': [value] };
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'object', options: { virtual: { group: { fields: ['o'] } } }, properties: {
        on: { type: 'boolean' }, hold: { type: 'boolean' },
        start: { type: 'boolean', controls: { injectTo: (v) => v ? { '../o': { z: 'middle' } } : {} } },
        o: { type: 'object', controls: { active: '/on === true' }, properties: {
          z: { type: 'string' }, y: field,
          held: { ...field, controls: { active: '/hold === true' } },
        } },
        finish: { type: 'boolean', controls: {
          derived: '/o/z === "middle" ? true : /finish',
          injectTo: (v) => v ? { ...pack({ ...payload, z: 'final' }), '../on': false } : {},
        } },
      } },
      defaultValue: { on: true, hold: true, o: { y: initial, held: initial, z: 'old' } },
      validationMode: ValidationMode.None,
    });
    root.find('/hold')!.setValue(false);
    if (batch) root.batch(() => root.find('/start')!.setValue(true));
    else root.find('/start')!.setValue(true);
    const retained = root.inactiveValues;
    root.setValue({ on: true, hold: true }, WriteOption.Merge);
    return { retained, value: root.find('/o')!.value };
  };
  const expected = { ...payload, z: 'final' };
  for (const batch of [false, true]) {
    const direct = run('direct', batch);
    expect.soft(direct.value, `direct ${batch}`).toEqual(expected);
    for (const route of ['parent', 'virtual'] as const) {
      const current = run(route, batch);
      expect.soft(current.value, `${route} ${batch}`).toEqual(expected);
      expect.soft(current.retained, `retained ${route} ${batch}`).toEqual(direct.retained);
    }
  }
});

it.each(['default', 'const'] as const)('new %s values do not acquire retention rights on a same-settlement appearance and exit', (fill) => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: {
      on: { type: 'boolean' },
      start: { type: 'boolean', controls: { injectTo: (v) => v ? { '../on': true } : {} } },
      o: { type: 'object', controls: { active: '/on === true' }, properties: {
        y: { type: 'string', ...(fill === 'default' ? { default: 'fill' } : {}) },
      }, ...(fill === 'const' ? { allOf: [{ properties: { y: { const: 'fill' } } }] } : {}) },
      close: { type: 'boolean', controls: { derived: '/o/y === "fill" ? true : /close', injectTo: (v) => v ? { '../on': false } : {} } },
    } },
    defaultValue: { on: false }, validationMode: ValidationMode.None,
  });
  root.find('/start')!.setValue(true);
  expect(root.value).toMatchObject({ on: false, close: true });
  expect(root.inactiveValues).toEqual([]);
});
