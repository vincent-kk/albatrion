import { describe, expect, it } from 'vitest';

import { setContext } from '../../core';
import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue, ...extra } as any) as any;

describe('schema-reference: default precedence', () => {
  // "Default precedence is node controls.default, parent fields, fragment controls.default, then standard default."
  const build = (levels: { node?: boolean; parent?: boolean; fragment?: boolean; standard?: boolean }) => ({
    type: 'object',
    properties: {
      c: {
        type: 'string',
        ...(levels.standard ? { default: 's' } : {}),
        ...(levels.node ? { controls: { default: 'n' } } : {}),
      },
    },
    ...(levels.parent ? { controls: { fields: [{ targets: ['c'], controls: { default: 'p' } }] } } : {}),
    ...(levels.fragment
      ? { allOf: [{ properties: { c: { type: 'string' } }, controls: { default: 'f' } }] }
      : {}),
  });
  const cases: [string, any, string][] = [
    ['all four', { node: true, parent: true, fragment: true, standard: true }, 'n'],
    ['without node', { parent: true, fragment: true, standard: true }, 'p'],
    ['without node and parent', { fragment: true, standard: true }, 'f'],
    ['standard only', { standard: true }, 's'],
    ['node and standard', { node: true, standard: true }, 'n'],
    ['parent and standard', { parent: true, standard: true }, 'p'],
  ];
  for (const [label, levels, expected] of cases)
    it(label, () => {
      expect(tree(build(levels), {}).value.c).toBe(expected);
    });
});

describe('expressions.md: context examples', () => {
  const schema = {
    type: 'object',
    properties: {
      v: { type: 'string', default: 'x', controls: { visible: '@.userRole === "admin"' } },
      r: { type: 'string', default: 'x', controls: { readOnly: '(@).permissions?.canEdit !== true' } },
    },
  };
  it('visible and readOnly follow the context prop', () => {
    const root = tree(schema, {}, { context: { userRole: 'admin', permissions: { canEdit: true } } });
    const first = [root.find('/v').isVisible, root.find('/r').isReadOnly];
    setContext(root, { userRole: 'user' });
    const second = [root.find('/v').isVisible, root.find('/r').isReadOnly];
    expect({ first, second }).toEqual({ first: [true, false], second: [false, true] });
  });
});

describe('expressions.md: watch and collection reads', () => {
  it('watchValues and a parenthesized collection read', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'number' } },
          total: { type: 'number', controls: { watch: ['../items'] } },
          note: { type: 'string', default: 'n', controls: { active: '(../items).length > 0' } },
        },
      },
      { items: [] },
    );
    const first = { w: root.find('/total').watchValues, note: root.value.note };
    root.find('/items').push(3);
    const second = { w: root.find('/total').watchValues, note: root.value.note };
    expect(JSON.parse(JSON.stringify({ first, second }))).toEqual({
      first: { w: [null] },
      second: { w: [[3]], note: 'n' },
    });
  });
});

describe('expressions.md: resetInteraction', () => {
  it('fires on a false-to-true turn', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          clear: { type: 'boolean', default: false },
          name: { type: 'string', controls: { resetInteraction: '../clear === true' } },
        },
      },
      {},
    );
    root.find('/name').setValue('typed');
    root.find('/name').setState?.({ touched: true, edited: true });
    root.find('/clear').setValue(true);
    expect(root.find('/name').value).toBe('typed');
  });
});

describe('troubleshooting.md: collection expression over an empty list', () => {
  it('(../items).length > 0 on an empty list reports no expression failure', () => {
    const records: any[] = [];
    const reporter = { hasConsumer: () => true, report: (record: any) => record.code !== 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING' && records.push(record) };
    const root = tree(
      {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' } },
          extra: { type: 'string', default: 'e', controls: { active: '(../items).length > 0' } },
        },
      },
      { items: [] },
      { errorReporter: reporter },
    );
    root.find('/items').push('a');
    root.find('/items').remove(0);
    expect({
      value: root.value,
      codes: records.map((record) => record.code),
    }).toEqual({ value: {}, codes: [] });
  });
});

describe('troubleshooting.md collection example: write paths that empty the list', () => {
  const schema = {
    type: 'object',
    properties: {
      items: { type: 'array', items: { type: 'string' } },
      extra: { type: 'string', default: 'e', controls: { active: '(../items).length > 0' } },
    },
  };
  const attempt = (step: (root: any) => void) => {
    const records: any[] = [];
    const reporter = { hasConsumer: () => true, report: (record: any) => record.code !== 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING' && records.push(record.code) };
    const root = tree(schema, { items: ['a'] }, { errorReporter: reporter });
    let thrown: any;
    try {
      step(root);
    } catch (error) {
      thrown = (error as any)?.code ?? String(error);
    }
    return { thrown, records, value: root.value, diagnostics: root.diagnostics?.status };
  };
  it('remove(0) of the last item', () => {
    expect(attempt((root) => root.find('/items').remove(0))).toEqual({
      thrown: undefined,
      records: [],
      value: {},
      diagnostics: 'stable',
    });
  });
  it('setValue([]) on the array', () => {
    expect(attempt((root) => root.find('/items').setValue([]))).toEqual({
      thrown: undefined,
      records: [],
      value: {},
      diagnostics: 'stable',
    });
  });
  it('clear()', () => {
    expect(attempt((root) => root.find('/items').clear())).toEqual({
      thrown: undefined,
      records: [],
      value: {},
      diagnostics: 'stable',
    });
  });
  it('control: the same gate written as (../items)?.length > 0', () => {
    const records: any[] = [];
    const reporter = { hasConsumer: () => true, report: (record: any) => record.code !== 'SCHEMA_FORM_WARNING.VALIDATOR_MISSING' && records.push(record.code) };
    const root = tree(
      { ...schema, properties: { ...schema.properties, extra: { type: 'string', default: 'e', controls: { active: '(../items)?.length > 0' } } } },
      { items: ['a'] },
      { errorReporter: reporter },
    );
    root.find('/items').remove(0);
    expect({ records, value: root.value }).toEqual({ records: [], value: {} });
  });
});

describe('diagnostic: does the degraded status clear later', () => {
  it('status after remove, then an unrelated write, then push', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' } },
          other: { type: 'string' },
          note: { type: 'string', default: 'n', controls: { active: '(../items).length > 0' } },
        },
      },
      { items: ['a'] },
    );
    const statuses: any[] = [];
    try {
      root.find('/items').remove(0);
    } catch {}
    statuses.push(root.diagnostics?.status);
    try {
      root.find('/other').setValue('x');
    } catch (error) {
      statuses.push('threw:' + (error as any)?.code);
    }
    statuses.push(root.diagnostics?.status);
    try {
      root.find('/items').push('b');
    } catch (error) {
      statuses.push('threw:' + (error as any)?.code);
    }
    statuses.push(root.diagnostics?.status);
    expect(statuses).toEqual(['stable', 'stable', 'stable']);
  });
});
