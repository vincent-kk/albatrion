/** Creates fresh identities for cold runs; never returns a reused object pool. */
export function createFixture(name: string): any {
  switch (name) {
    case 'scalar':
      return '한글😀"\\\u0000\ud800';
    case 'small':
      return { id: 1, name: 'hello', active: true, score: 12, secret: 'omit' };
    case 'deep': {
      let value: any = { leaf: 1 };
      for (let i = 0; i < 100; i++) value = { next: value };
      return value;
    }
    case 'wide':
      return Object.fromEntries(
        Array.from({ length: 200 }, (_, i) => [`field${i}`, i]),
      );
    case 'dense':
      return Array.from({ length: 1000 }, (_, i) => i);
    case 'sparse':
      return Object.assign(new Array(1000), {
        1: undefined,
        999: 'tail',
        extra: 'x',
      });
    case 'schema':
      return {
        type: 'object',
        properties: {
          name: { type: 'string', title: '이름' },
          age: { type: 'number', minimum: 0 },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['name'],
      };
    case 'escaping':
      return JSON.parse(
        '{"0":"한글😀","":"\\\"\\\\\\u0000","__proto__":1,"constructor":2,"prototype":3}',
      );
    case 'cycle': {
      const value: any = { name: 'cycle' };
      value.self = value;
      value.child = { parent: value };
      return value;
    }
    case 'dag': {
      const leaf = { x: 1 };
      return Array.from({ length: 100 }, () => leaf);
    }
    case 'tree':
      return Array.from({ length: 100 }, () => ({ x: 1 }));
    case 'extended': {
      const value: any = {
        date: new Date(123),
        map: new Map(),
        set: new Set(),
        big: 4n,
        missing: undefined,
        numbers: [NaN, Infinity, -Infinity, -0],
        regexp: /x/gi,
      };
      value.map.set(value.date, value);
      value.set.add(value);
      return value;
    }
    case 'limit':
      return new Array(1000000);
    default:
      throw new Error(`Unknown fixture: ${name}`);
  }
}

/** Shared workload axes used by Vitest and the independent-process raw sampler. */
export const fixtureNames = [
  'scalar',
  'small',
  'deep',
  'wide',
  'dense',
  'sparse',
  'schema',
  'escaping',
  'cycle',
  'dag',
  'tree',
  'extended',
  'limit',
];
