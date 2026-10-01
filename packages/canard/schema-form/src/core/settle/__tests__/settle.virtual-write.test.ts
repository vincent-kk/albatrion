import { describe, expect, it } from 'vitest';

import { SchemaFormError } from '../../../errors';
import { SetValueOption } from '../../types/value';
import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { getGateRegistry } from '../utils/gates/getGateRegistry';

const periodSchema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    endDate: { type: 'string' },
  },
  options: { virtual: { period: { fields: ['startDate', 'endDate'] } } },
};

// filid:contract settle-virtual
describe('virtual writes and referenced siblings', () => {
  it('42C-02 NODE-034 NODE-054 reads loaded siblings through their real nodes', () => {
    const { root } = makeSchemaNodeTree(periodSchema, { snapshot: {
      startDate: '2021-04-01', endDate: '2021-04-02',
    } });
    root.resetSubtree();
    const period = root.find('/period')!;
    const startDate = root.find('/startDate')!;
    const endDate = root.find('/endDate')!;
    expect(period.value).toEqual(['2021-04-01', '2021-04-02']);
    expect(period.children).toEqual([startDate, endDate]);
    expect(period.find('/period/startDate')).toBe(startDate);
    expect(period.find('/period/startDate')?.path).toBe('/startDate');
  });

  it('42C-02 18C-21 clears both leaves without refilling an existing default', () => {
    const { root } = makeSchemaNodeTree({ ...periodSchema,
      properties: { ...periodSchema.properties,
        startDate: { type: 'string', default: 'D' } },
    }, { snapshot: { startDate: '2021-04-01', endDate: '2021-04-02' } });
    root.resetSubtree();
    root.find('/period')!.setValue(undefined);
    expect(root.find('/startDate')?.value).toBeUndefined();
    expect(root.find('/endDate')?.value).toBeUndefined();
    expect(root.find('/period')?.value).toEqual([undefined, undefined]);
    expect(root.outputValue).toEqual({});
  });

  it('42C-02 splits an array and reassembles after a direct leaf write', () => {
    const { root } = makeSchemaNodeTree(periodSchema);
    root.resetSubtree();
    const period = root.find('/period')!;
    period.setValue(['a', 'b']);
    expect(root.outputValue).toEqual({ startDate: 'a', endDate: 'b' });
    expect(period.value).toEqual(['a', 'b']);
    const revision = Reflect.get(period, 'revision');
    root.find('/startDate')!.setValue('c');
    expect(period.value).toEqual(['c', 'b']);
    expect(Reflect.get(period, 'revision')).toBeGreaterThan(revision);
    period.setValue([7, 'b']);
    expect(period.value).toEqual(['7', 'b']);
  });

  it('45C-01 Merge performs a partial write at each referenced node', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      details: { type: 'object', properties: {
        first: { type: 'string' }, second: { type: 'string' },
      } },
    }, options: { virtual: { group: { fields: ['details'] } } } },
    { snapshot: { details: { first: 'old', second: 'keep' } } });
    root.resetSubtree();
    root.find('/details/first')!.setValue('changed');
    expect(root.find('/group')?.value).toEqual([
      { first: 'changed', second: 'keep' },
    ]);
    root.find('/group')!.setValue([{ first: 'new' }], SetValueOption.Merge);
    expect(root.find('/details')?.value).toEqual({ first: 'new', second: 'keep' });
    expect(root.find('/group')?.value).toEqual([{ first: 'new', second: 'keep' }]);
    root.find('/group')!.setValue([{ first: 'whole' }]);
    expect(root.find('/details')?.value).toEqual({ first: 'whole' });
  });

  it('42C-02 keeps real siblings live when their virtual group exits', () => {
    const { root } = makeSchemaNodeTree({ ...periodSchema,
      properties: { enabled: { type: 'boolean' }, ...periodSchema.properties },
      options: { virtual: { period: { fields: ['startDate', 'endDate'],
        controls: { active: '../enabled' } } } },
    }, { snapshot: { enabled: true,
      startDate: '2021-04-01', endDate: '2021-04-02' } });
    root.resetSubtree();
    const startDate = root.find('/startDate')!;
    const endDate = root.find('/endDate')!;
    expect(root.find('/period')).not.toBeNull();
    root.find('/enabled')!.setValue(false);
    expect(root.find('/period')).toBeNull();
    expect(root.find('/startDate')).toBe(startDate);
    expect(root.find('/endDate')).toBe(endDate);
    expect(Reflect.get(startDate, 'detached')).toBe(false);
    expect(Reflect.get(endDate, 'detached')).toBe(false);
  });

  it('42C-02 keeps a real sibling gate registered when its virtual group exits', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      enabled: { type: 'boolean' }, flag: { type: 'boolean' },
      startDate: { type: 'string', controls: { active: '../flag' } },
      endDate: { type: 'string' },
    }, options: { virtual: { period: { fields: ['startDate', 'endDate'],
      controls: { active: '../enabled' } } } } },
    { snapshot: { enabled: true, flag: true, startDate: 'a', endDate: 'b' } });
    root.resetSubtree();
    const registry = getGateRegistry(Reflect.get(root, 'runtime'));
    expect(registry.mayChangeOwnDeclarationAt('/startDate', new Set(['/flag']), new Set([''])))
      .toBe(true);
    root.find('/enabled')!.setValue(false);
    expect(root.find('/period')).toBeNull();
    expect(registry.mayChangeOwnDeclarationAt('/startDate', new Set(['/flag']), new Set([''])))
      .toBe(true);
  });

  it.each([
    { label: 'null', value: null },
    { label: 'string', value: 'x' },
    { label: 'short array', value: ['a'] },
  ])(
    '42C-02 ERROR-195 rejects invalid virtual input $label before changing values',
    ({ value }) => {
      const { root } = makeSchemaNodeTree(periodSchema, { snapshot: {
        startDate: '2021-04-01', endDate: '2021-04-02',
      } });
      root.resetSubtree();
      const before = root.outputValue;
      const period = root.find('/period')!;
      let caught: unknown;
      try { period.setValue(value); } catch (error) { caught = error; }
      expect(caught).toBeInstanceOf(SchemaFormError);
      expect(caught).toMatchObject({
        code: 'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES',
        details: { path: '/period', expected: 2, received: value },
      });
      expect(root.outputValue).toBe(before);
      expect(period.value).toEqual(['2021-04-01', '2021-04-02']);
    },
  );
});
