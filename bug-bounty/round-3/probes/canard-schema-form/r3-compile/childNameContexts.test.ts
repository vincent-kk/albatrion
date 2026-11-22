import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

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

const names = ['plain', 'a/b', '~', '*', '@', '.', '..', '%2a', '%', 'a b', '', '#', '__proto__', 'constructor', '0'];

const attempt = (fn: () => unknown) => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

describe('child names outside expressions', () => {
  it('controls.fields targets select the literal child name', () => {
    const failures: any[] = [];
    for (const name of names) {
      const result = attempt(() => {
        const root = tree(
          {
            type: 'object',
            properties: {
              on: { type: 'boolean', default: false },
              [name]: { type: 'string', default: 'v' },
              other: { type: 'string', default: 'o' },
            },
            controls: { fields: [{ targets: [name], controls: { active: './on === true' } }] },
          },
          {},
        );
        const before = root.value;
        root.find('/on').setValue(true);
        return { before, after: root.value };
      });
      const expected = {
        before: { on: false, other: 'o' },
        after: { on: true, [name]: 'v', other: 'o' },
      };
      if (JSON.stringify(result) !== JSON.stringify(expected))
        failures.push({ name, result });
    }
    expect(failures).toEqual([]);
  });

  it('discriminator names the literal tag property', () => {
    const failures: any[] = [];
    for (const name of names) {
      const result = attempt(() => {
        const root = tree(
          {
            type: 'object',
            properties: { [name]: { type: 'string', default: 'a' } },
            controls: { discriminator: name },
            oneOf: [
              { properties: { [name]: { const: 'a' }, ka: { type: 'string', default: 'A' } } },
              { properties: { [name]: { const: 'b' }, kb: { type: 'string', default: 'B' } } },
            ],
          },
          {},
        );
        const before = root.value;
        root.find('/' + esc(name)).setValue('b');
        return { before, after: root.value };
      });
      const expected = {
        before: { [name]: 'a', ka: 'A' },
        after: { [name]: 'b', kb: 'B' },
      };
      if (JSON.stringify(result) !== JSON.stringify(expected))
        failures.push({ name, result });
    }
    expect(failures).toEqual([]);
  });

  it('virtual group fields name literal siblings', () => {
    const failures: any[] = [];
    for (const name of names) {
      if (name === 'g') continue;
      const result = attempt(() => {
        const root = tree(
          {
            type: 'object',
            properties: {
              [name]: { type: 'string', default: 'v' },
              other: { type: 'string', default: 'o' },
            },
            options: { virtual: { grp: { fields: [name, 'other'] } } },
          },
          {},
        );
        const group = root.find('/grp');
        return { tuple: group?.value };
      });
      if (JSON.stringify(result) !== JSON.stringify({ tuple: ['v', 'o'] }))
        failures.push({ name, result });
    }
    expect(failures).toEqual([]);
  });

  it('propertyOrder orders literal names', () => {
    const failures: any[] = [];
    for (const name of names) {
      const result = attempt(() => {
        const root = tree(
          {
            type: 'object',
            properties: {
              first: { type: 'string', default: 'f' },
              [name]: { type: 'string', default: 'v' },
            },
            options: { propertyOrder: [name] },
          },
          {},
        );
        return Object.keys(root.outputValue ?? root.value);
      });
      const expected = name === '0' ? ['0', 'first'] : [name, 'first'];
      if (JSON.stringify(result) !== JSON.stringify(expected))
        failures.push({ name, result });
    }
    expect(failures).toEqual([]);
  });

  it('required marks the literal child name', () => {
    const failures: any[] = [];
    for (const name of names) {
      const result = attempt(() => {
        const root = tree(
          {
            type: 'object',
            properties: {
              [name]: { type: 'string' },
              other: { type: 'string' },
            },
            required: [name],
          },
          {},
        );
        return {
          named: root.find('/' + esc(name))?.isRequired,
          other: root.find('/other')?.isRequired,
        };
      });
      if (JSON.stringify(result) !== JSON.stringify({ named: true, other: false }))
        failures.push({ name, result });
    }
    expect(failures).toEqual([]);
  });
});
