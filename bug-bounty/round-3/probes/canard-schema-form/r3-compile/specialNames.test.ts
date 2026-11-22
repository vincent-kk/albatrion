import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

/** Documented segment spelling: RFC 6901 escapes, then the four reserved percent forms. */
const esc = (name: string) => {
  switch (name) {
    case '*':
      return '%2A';
    case '..':
      return '%2E%2E';
    case '.':
      return '%2E';
    case '@':
      return '%40';
    default:
      return name.replace(/~/g, '~0').replace(/\//g, '~1');
  }
};

/** Names that the documented grammar can spell in an expression (no whitespace or brackets). */
const names = [
  'plain',
  'café',
  '한글',
  '😀',
  '$x',
  'a-b',
  'a.b',
  'a~b',
  'a/b',
  '~',
  '/',
  '@',
  '*',
  '.',
  '..',
  '%',
  '%25',
  'a%20b',
  '#',
  'a#b',
  'a@b',
  '__proto__',
  'constructor',
  'toString',
  '0',
  '123',
  'a:b',
  'a,b',
  'a?b',
  'a=b',
  'a!b',
  'a+b',
  'a&b',
  'a|b',
  'a<b',
  "a'b",
  'a"b',
];

const forms: [string, (n: string) => string][] = [
  ['sibling', (n) => `../${esc(n)}`],
  ['absolute', (n) => `/${esc(n)}`],
  ['fragment', (n) => `#/${esc(n)}`],
];

const run = (name: string, ref: string) => {
  const schema = {
    type: 'object',
    properties: {
      [name]: { type: 'string', default: 'v' },
      d: { type: 'string', controls: { derived: `(${ref}) + "!"` } },
      g: { type: 'string', default: 'g', controls: { active: `(${ref}) === "on"` } },
      w: { type: 'string', controls: { watch: [ref] } },
    },
  };
  let root: any;
  try {
    root = tree(schema, {});
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
  const snapshot = () => ({
    d: root.find('/d')?.value,
    g: root.find('/g')?.value,
    w: root.find('/w')?.watchValues?.[0],
  });
  const initial = snapshot();
  root.find('/' + esc(name)).setValue('on');
  const afterOn = snapshot();
  root.setValue({ [name]: 'z' }, 2 /* Merge */);
  const afterRoot = snapshot();
  return { initial, afterOn, afterRoot };
};

const expected = {
  initial: { d: 'v!', g: undefined, w: 'v' },
  afterOn: { d: 'on!', g: 'g', w: 'on' },
  afterRoot: { d: 'z!', g: undefined, w: 'z' },
};

describe('expression references to special property names', () => {
  for (const [label, form] of forms) {
    it(`${label} form`, () => {
      const failures: any[] = [];
      for (const name of names) {
        const result = run(name, form(name));
        if (JSON.stringify(result) !== JSON.stringify(expected))
          failures.push({ name, ref: form(name), result });
      }
      expect(failures).toEqual([]);
    });
  }
});
