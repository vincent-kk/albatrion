import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { SetValueOption, ValidationMode } from '@/schema-form';

it.each(['transition', 'hostWheel'] as const)(
  '%s rollback discards automatic inactive sources and permits the following valid write',
  (kind) => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'object',
        ...(kind === 'transition' ? { allOf: [
          { controls: { active: './a === "0"' }, properties: { a: { type: 'boolean' } } },
          { controls: { active: './a !== "0"' }, properties: { a: { type: 'string' } } },
        ] } : {}),
        properties: {
        open: { type: 'boolean' }, loop: { type: 'boolean' },
        a: { type: ['string', 'boolean'] },
        trigger: { type: 'boolean', controls: { injectTo: (value) => value ? {
          '../box/held': { a: 'automatic', list: ['automatic', 'extra'] },
          ...(kind === 'transition' ? { '../a': 0 } : { '../loop': true }),
        } : {} } },
        box: { type: 'object', properties: {
          held: { type: 'object', controls: { active: '/open === true' }, properties: {
            a: { type: 'string' }, list: { type: 'array', items: { type: 'string' } },
          } },
        } },
        oscillation: { type: 'number', default: 1, controls: {
          active: kind === 'hostWheel' ? '/loop === true && !../oscillation' : '/loop === true',
        } },
      } },
      defaultValue: { open: false, loop: false, box: { held: { a: 'original', list: ['original'] } } },
      validationMode: ValidationMode.None,
    });
      expect(() => root.find('/trigger')!.setValue(true)).toThrowError(expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED' }));
      expect(root.inactiveValues).toEqual([
        { path: '/box/held/a', value: 'original' },
        { path: '/box/held/list', value: ['original'] },
      ]);
    root.setValue({ trigger: false, open: true }, SetValueOption.Merge);
    expect(root.find('/box/held')!.value).toEqual({ a: 'original', list: ['original'] });
    expect(root.find('/loop')!.value).toBe(false);
  },
);

it.each(['plain', 'batch'] as const)('reset restores inactive descendants before revival in %s', (call) => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: {
      open: { type: 'boolean' }, unrelated: { type: 'string' },
      box: { type: 'object', properties: {
        held: { type: 'array', items: { type: 'string' }, controls: { active: '/open === true' } },
      } },
    } },
    defaultValue: { open: true, box: { held: ['loaded'] } },
    validationMode: ValidationMode.None,
  });
  root.find('/box/held')!.setValue(['edited']);
  root.find('/open')!.setValue(false);
  const reset = () => {
    root.find('/unrelated')!.setValue('kept');
    root.find('/box')!.resetSubtree();
  };
  if (call === 'batch') root.batch(reset); else reset();
  root.find('/open')!.setValue(true);
  expect(root.find('/box/held')!.value).toEqual(['loaded']);
  expect(root.find('/unrelated')!.value).toBe('kept');
});

it.each(['default', 'const'] as const)(
  'an inherited %s fill does not replace the retained write boundary on exit',
  (fill) => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: {
        on: { type: 'boolean' },
        source: { type: 'boolean', controls: { injectTo: (value) => value ? { '../o': { marker: 'middle' } } : {} } },
        o: { type: 'object', controls: { active: '/on === true' }, properties: {
          marker: { type: 'string' },
          child: { type: 'object', properties: { name: { type: 'string' } },
            ...(fill === 'default' ? { default: { name: 'fill' } } : { const: { name: 'fill' } }),
          },
        } },
        close: { type: 'boolean', controls: { derived: '/o/marker === "middle" ? true : /close',
          injectTo: (value) => value ? { '../on': false } : {},
        } },
      } },
      defaultValue: { on: true, o: { marker: 'old', child: { name: 'original' } } },
      validationMode: ValidationMode.None,
    });
    root.find('/source')!.setValue(true);
    expect(root.inactiveValues).toContainEqual({ path: '/o/child/name', value: 'original' });
    root.find('/on')!.setValue(true, SetValueOption.DisableAutomaticWrites);
    expect(root.find('/o/child/name')!.value).toBe('original');
  },
);
