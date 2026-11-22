import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const P = {
  type: 'object',
  properties: {
    a: { type: 'string', default: 'v' },
    b: { type: 'string', controls: { derived: '(../a) + "!"' } },
    on: { type: 'boolean', default: false },
    g: { type: 'string', default: 'g', controls: { active: '../on === true' } },
  },
};

const scenario = (defs: Record<string, unknown>, refX: string, refY: string) => {
  const root = tree(
    {
      type: 'object',
      properties: { x: { $ref: refX }, y: { $ref: refY } },
      $defs: defs,
    },
    {},
  );
  const seen = [root.value];
  root.find('/y/a').setValue('w');
  root.find('/y/on').setValue(true);
  seen.push(root.value);
  root.find('/x/a').setValue('u');
  root.find('/x/on').setValue(true);
  root.find('/y/on').setValue(false);
  seen.push(root.value);
  return seen;
};

describe('EQ8 spellings of one $ref target', () => {
  const baseline = scenario({ 'a b': P }, '#/$defs/a b', '#/$defs/a b');

  const variants: [string, Record<string, unknown>, string, string][] = [
    ['raw space vs percent space', { 'a b': P }, '#/$defs/a b', '#/$defs/a%20b'],
    ['percent space both', { 'a b': P }, '#/$defs/a%20b', '#/$defs/a%20b'],
    ['percent-encoded $', { 'a b': P }, '#/%24defs/a%20b', '#/$defs/a b'],
    ['lower vs upper hex', { 'a b': P }, '#/$defs/a%20b', '#/$defs/a%20b'],
  ];
  for (const [label, defs, refX, refY] of variants)
    it(label, () => {
      expect(scenario(defs, refX, refY)).toEqual(baseline);
    });

  it('tilde escape against percent-encoded tilde escape', () => {
    const left = scenario({ 'a/b': P }, '#/$defs/a~1b', '#/$defs/a~1b');
    const right = scenario({ 'a/b': P }, '#/$defs/a~1b', '#/$defs/a%7E1b');
    expect(right).toEqual(left);
  });

  it('non-ASCII raw against percent-encoded UTF-8', () => {
    const left = scenario({ 'é': P }, '#/$defs/é', '#/$defs/é');
    const right = scenario({ 'é': P }, '#/$defs/é', '#/$defs/%C3%A9');
    expect(right).toEqual(left);
  });

  it('definitions keyword against $defs keyword', () => {
    const root = tree(
      {
        type: 'object',
        properties: { x: { $ref: '#/definitions/P' }, y: { $ref: '#/definitions/P' } },
        definitions: { P },
      },
      {},
    );
    root.find('/y/a').setValue('w');
    expect(root.value.y.b).toBe('w!');
  });
});

describe('special names in $ref targets', () => {
  const names = ['%', '%25', '~', '/', '*', '..', '.', '@', '#', ' ', '', 'a"b', '__proto__', 'constructor'];
  const encode = (name: string) =>
    encodeURIComponent(name.replace(/~/g, '~0').replace(/\//g, '~1'));
  it('a $defs entry under each name resolves and reacts', () => {
    const failures: any[] = [];
    for (const name of names) {
      try {
        const root = tree(
          {
            type: 'object',
            properties: { x: { $ref: '#/$defs/' + encode(name) } },
            $defs: { [name]: P },
          },
          {},
        );
        root.find('/x/a').setValue('w');
        root.find('/x/on').setValue(true);
        const value = root.value;
        if (JSON.stringify(value) !== JSON.stringify({ x: { a: 'w', b: 'w!', on: true, g: 'g' } }))
          failures.push({ name, value });
      } catch (error) {
        failures.push({ name, error: String((error as any)?.code ?? error) });
      }
    }
    expect(failures).toEqual([]);
  });
});
