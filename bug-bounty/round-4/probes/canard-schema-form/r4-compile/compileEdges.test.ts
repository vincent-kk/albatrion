import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';
import { createTestValidator } from '../../core/__tests__/fixtures/createTestValidator';

const tree = (jsonSchema: any, defaultValue?: any, extra: any = {}) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue, ...extra } as any) as any;

const attempt = <T>(fn: () => T): T | { error: string } => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

describe('P1 draft-07 fragment $id (location-independent identifier)', () => {
  const byPointer = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: { home: { $ref: '#/definitions/address' } },
    definitions: {
      address: {
        $id: '#address',
        type: 'object',
        properties: { city: { type: 'string', default: 'Seoul' } },
      },
    },
  };
  const inlineId = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      home: {
        $id: '#home',
        type: 'object',
        properties: { city: { type: 'string', default: 'Seoul' } },
      },
    },
  };

  it('reference: plain AJV (draft-07) compiles both schemas and validates through them', () => {
    const ajv = new Ajv({ strict: false });
    const a = ajv.compile(byPointer);
    const b = new Ajv({ strict: false }).compile(inlineId);
    expect([
      a({ home: { city: 'x' } }),
      a({ home: { city: 1 } }),
      b({ home: { city: 'x' } }),
      b({ home: { city: 1 } }),
    ]).toEqual([true, false, true, false]);
  });

  it('the form loads a definition with a fragment $id referenced by JSON pointer', () => {
    const result = attempt(() => tree(byPointer, {}).value);
    expect(result).toEqual({ home: { city: 'Seoul' } });
  });

  it('the form loads an inline property that declares a fragment $id', () => {
    const result = attempt(() => tree(inlineId, {}).value);
    expect(result).toEqual({ home: { city: 'Seoul' } });
  });

  it('control: the same schemas without the $id load', () => {
    const strip = (schema: any) =>
      JSON.parse(JSON.stringify(schema).replace(/"\$id":"#[a-z]+",/g, ''));
    expect([
      attempt(() => tree(strip(byPointer), {}).value),
      attempt(() => tree(strip(inlineId), {}).value),
    ]).toEqual([{ home: { city: 'Seoul' } }, { home: { city: 'Seoul' } }]);
  });
});

describe('P2 regular expression literal after return in a statement body', () => {
  const schema = (expression: string) => ({
    type: 'object',
    properties: {
      code: { type: 'string' },
      ok: { type: 'boolean', controls: { derived: expression } },
      extra: {
        type: 'string',
        default: 'X',
        controls: { active: expression },
      },
    },
  });
  const run = (expression: string) =>
    attempt(() => {
      const root = tree(schema(expression), {});
      const steps: any[] = [];
      for (const code of ['123', 'abc', '42']) {
        const thrown = attempt(() => root.find('/code').setValue(code));
        steps.push({
          code,
          ok: root.value?.ok,
          extra: root.value?.extra,
          thrown: thrown && (thrown as any).error,
        });
      }
      return steps;
    });
  const expected = [
    { code: '123', ok: true, extra: 'X', thrown: undefined },
    { code: 'abc', ok: false, extra: undefined, thrown: undefined },
    { code: '42', ok: true, extra: 'X', thrown: undefined },
  ];

  it('control: the documented expression form reads only ../code', () => {
    expect(run('/^\\d+$/.test(../code)')).toEqual(expected);
  });

  it('control: a statement body that assigns the literal first works', () => {
    expect(
      run('{ const pattern = /^\\d+$/; return pattern.test(../code); }'),
    ).toEqual(expected);
  });

  it('a statement body returning the same regular expression literal works', () => {
    expect(run('{ return /^\\d+$/.test(../code); }')).toEqual(expected);
  });

  it('the same body with a string literal (scanner path) works', () => {
    expect(
      run('{ if (../code === "") return false; return /^\\d+$/.test(../code); }'),
    ).toEqual(expected);
  });
});

describe('P3 absolute path spellings with dot segments in expressions and watch', () => {
  const spelled = (path: string) => ({
    type: 'object',
    properties: {
      g: { type: 'object', properties: { x: { type: 'string' } } },
      top: { type: 'string' },
      out: { type: 'string', controls: { derived: `(${path}) ?? "none"` } },
      gated: {
        type: 'string',
        default: 'G',
        controls: { active: `${path} === "on"` },
      },
      watcher: { type: 'string', controls: { watch: [path] } },
    },
  });
  const observe = (path: string) =>
    attempt(() => {
      const root = tree(spelled(path), { top: 'a' });
      const seen: any[] = [];
      const read = () => ({
        out: root.value.out,
        gated: root.value.gated,
        watch: root.find('/watcher').watchValues?.[0],
      });
      seen.push(read());
      root.find('/top').setValue('on');
      seen.push(read());
      root.find('/top').setValue('b');
      seen.push(read());
      return seen;
    });

  it('baseline /top', () => {
    expect(observe('/top')).toEqual([
      { out: 'a', gated: undefined, watch: 'a' },
      { out: 'on', gated: 'G', watch: 'on' },
      { out: 'b', gated: undefined, watch: 'b' },
    ]);
  });

  for (const path of ['/g/../top', '#/g/../top', '/./top', '#/./top', '/g/x/../../top']) {
    it(`${path} behaves like /top`, () => {
      expect(observe(path)).toEqual(observe('/top'));
    });
  }

  it('control: relative ../g/../top behaves like /top', () => {
    expect(observe('../g/../top')).toEqual(observe('/top'));
  });

  it('control: injectTo with the relative target ../g/../top', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          g: { type: 'object', properties: { x: { type: 'string' } } },
          top: { type: 'string' },
          src: {
            type: 'string',
            controls: { injectTo: (value: unknown) => ({ '../g/../top': value }) },
          },
        },
      },
      {},
    );
    const thrown = attempt(() => root.find('/src').setValue('v'));
    expect({ top: root.value.top, thrown }).toEqual({ top: 'v', thrown: undefined });
  });

  it('diagnostic: injectTo with the absolute spelling /g/../top', () => {
    const root = tree(
      {
        type: 'object',
        properties: {
          g: { type: 'object', properties: { x: { type: 'string' } } },
          top: { type: 'string' },
          src: {
            type: 'string',
            controls: { injectTo: (value: unknown) => ({ '/g/../top': value }) },
          },
        },
      },
      {},
    );
    const thrown = attempt(() => root.find('/src').setValue('v'));
    expect({ top: root.value.top, thrown }).toEqual({ top: 'v', thrown: undefined });
  });

  it('control: node.find resolves the same absolute spellings to /top', () => {
    const root = tree(spelled('/top'), { top: 'a' });
    expect(
      ['/g/../top', '#/g/../top', '/./top', '#/./top', '/g/x/../../top'].map(
        (path) => root.find(path)?.path,
      ),
    ).toEqual(['/top', '/top', '/top', '/top', '/top']);
  });
});

describe('P5 property names with a space (round 3 open lead)', () => {
  const schema = (expression: string, watch?: string) => ({
    type: 'object',
    properties: {
      'first name': { type: 'string' },
      out: {
        type: 'string',
        controls: {
          derived: expression,
          ...(watch ? { watch: [watch] } : {}),
        },
      },
    },
  });
  const run = (expression: string, watch?: string) =>
    attempt(() => {
      const root = tree(schema(expression, watch), { 'first name': 'a' });
      const seen = [[root.value.out, root.find('/out').watchValues?.[0]]];
      root.find('/first name').setValue('b');
      seen.push([root.value.out, root.find('/out').watchValues?.[0]]);
      return seen;
    });

  it('diagnostic: direct path spelling', () => {
    expect(run('../first name')).toEqual([
      ['a', undefined],
      ['b', undefined],
    ]);
  });

  it('diagnostic: bracket access on the parent', () => {
    expect(run('(../)["first name"]')).toEqual([
      ['a', undefined],
      ['b', undefined],
    ]);
  });

  it('diagnostic: watch path with a space', () => {
    expect(run('"x"', '../first name')).toEqual([
      ['x', 'a'],
      ['x', 'b'],
    ]);
  });
});

describe('P4 boolean if schemas select the branch AJV applies', () => {
  const schema = (condition: unknown) => ({
    type: 'object',
    properties: { a: { type: 'string' } },
    if: condition,
    then: { properties: { t: { type: 'string', default: 'T' } } },
    else: { properties: { e: { type: 'string', default: 'E' } } },
  });
  for (const condition of [true, false, {}, { not: {} }]) {
    it(`if: ${JSON.stringify(condition)}`, () => {
      const ajv = new Ajv({ strict: false });
      const validate = ajv.compile({
        ...schema(condition),
        then: { required: ['t'] },
        else: { required: ['e'] },
      });
      const thenApplies = validate({ t: 'x' }) && !validate({ e: 'x' });
      const result = attempt(() => {
        const root = tree(schema(condition), {}, {
          validator: createTestValidator(),
        });
        return root.value;
      });
      expect(result).toEqual(thenApplies ? { t: 'T' } : { e: 'E' });
    });
  }
});
