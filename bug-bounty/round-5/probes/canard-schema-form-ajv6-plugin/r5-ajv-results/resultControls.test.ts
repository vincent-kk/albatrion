/**
 * r5-ajv-results controls: decimal multipleOf on the default instance, and overlapping, out-of-order,
 * nested and failing calls of one compiled validator. Imports the plugin source and the AJV 6.12.6 copy the plugin resolves.
 * Every test here is expected to pass; they back the "hypotheses checked and not bugs" list.
 */
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator, plugin } from '../../index';

type Issue = { keyword?: string; dataPath: string };
const summarize = (issues: Issue[] | null) =>
  issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);

/** Seeded generator (mulberry32) so failures reproduce. */
const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** Exact decimal text of `units * 10^-places`. */
const decimal = (units: bigint, places: number) => {
  const negative = units < 0n;
  const digits = (negative ? -units : units).toString().padStart(places + 1, '0');
  const text = places ? `${digits.slice(0, -places)}.${digits.slice(-places)}` : digits;
  return Number(`${negative ? '-' : ''}${text}`);
};

const verdict = async (multipleOf: number, value: number) =>
  summarize(
    (await plugin.validator.compile({
      type: 'object',
      properties: { x: { type: 'number', multipleOf } },
    } as never)({ x: value })) as Issue[] | null,
  );

describe('default instance: decimal multipleOf', () => {
  it.each([
    [0.01, -19.99], [0.1, -0.3], [1e-7, -3e-7], [1e-7, 3e-7], [0.5, -0.5], [0.1, -0],
    [0.01, 0], [3, -9], [1e-300, 3e-300], [2.5e-308, 5e-308], [0.07, 0.21], [1.1, 3.3],
    [0.3, 0.9], [1e-10, 3e-10], [0.00001, 9.99999], [0.001, -999.999], [1e21, 3e21],
    [1, 1e21], [0.01, 10000],
  ])('[control] accepts multipleOf %d for %d', async (multipleOf, value) => {
    expect(await verdict(multipleOf, value)).toEqual([]);
  });

  it.each([[0.01, 19.995], [0.1, 0.35], [0.1, -0.35], [0.3, 0.300001]])(
    '[control] rejects multipleOf %d for %d',
    async (multipleOf, value) => {
      expect(await verdict(multipleOf, value)).toEqual(['multipleOf /x']);
    },
  );

  it('[control] 2,000 seeded exact decimal multiples with |quotient| <= 1e6 pass and half-step values fail', async () => {
    const next = random(20261120);
    const wrong: string[] = [];
    for (let index = 0; index < 1000; index++) {
      const places = Math.floor(next() * 7);
      const step = BigInt(1 + Math.floor(next() * 99));
      const count = BigInt(Math.floor(next() * 1e6)) * (next() < 0.5 ? -1n : 1n);
      const divisor = decimal(step, places);
      const exact = decimal(step * count, places);
      const half = decimal((2n * step * count + step) * 5n, places + 1);
      if ((await verdict(divisor, exact)).length) wrong.push(`rejected ${exact} for ${divisor}`);
      if (!(await verdict(divisor, half)).length) wrong.push(`accepted ${half} for ${divisor}`);
    }
    expect(wrong).toEqual([]);
  });
});

describe('one compiled validator: overlapping, out-of-order, nested and failing calls', () => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  let nested: (value: unknown) => unknown = () => null;
  const createInstance = () => {
    const ajv = new Ajv({ allErrors: true });
    ajv.addKeyword('available', {
      async: true,
      validate: async (_schema: unknown, data: unknown) => {
        const text = String(data);
        await sleep(Number(text.match(/\d+/)?.[0] ?? 1));
        if (text.includes('boom')) throw new Error('boom');
        return !text.startsWith('taken');
      },
    });
    ajv.addKeyword('nestedOk', {
      async: true,
      validate: async (_schema: unknown, data: unknown) =>
        data === null || typeof data !== 'object' || (await nested(data)) === null,
    });
    return ajv;
  };
  const inputs = [
    { name: 'taken30' },
    { name: 'free5' },
    { name: 'x1' },
    { name: 'boom10' },
    { name: 'free20', kid: { name: 'taken2' } },
    { name: 'free3', kid: { name: 'ok1' } },
    { name: 'free1' },
  ];
  const settle = async (result: unknown) => {
    try {
      return summarize((await result) as Issue[] | null);
    } catch (error) {
      return `rejected: ${(error as Error).message}`;
    }
  };

  for (const withId of [false, true])
    it(`[control] calls overlapped with Promise.all equal the same calls one by one (${withId ? 'root with $id' : 'root without $id'})`, async () => {
      const schema = {
        ...(withId ? { $id: 'https://example.com/r5-overlap.json' } : {}),
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, available: true },
          kid: { nestedOk: true },
        },
      };
      const validator = createValidator(createInstance());
      const validate = validator.compile(schema as never);
      const otherForm = validator.compile(structuredClone(schema) as never);
      nested = validate;
      const sequential: unknown[] = [];
      for (const input of inputs) sequential.push(await settle(validate(input)));
      const overlapped = await Promise.all(
        inputs.map((input, index) => settle((index % 2 ? otherForm : validate)(input))),
      );
      expect(overlapped).toEqual(sequential);
      expect(sequential).toEqual([
        ['available /name'],
        [],
        ['minLength /name'],
        'rejected: boom',
        ['nestedOk /kid'],
        [],
        [],
      ]);
    });
});

describe('ajv6: a keyword exception that carries an errors array', () => {
  for (const withId of [false, true])
    it(`[control] an asynchronous keyword rejecting with AggregateError rejects validation with that error (${withId ? 'root with $id' : 'root without $id'})`, async () => {
      const ajv = new Ajv({ allErrors: true });
      ajv.addKeyword('remoteCheck', {
        async: true,
        validate: async () => {
          throw new AggregateError([new Error('server a down')], 'all down');
        },
      });
      const validate = createValidator(ajv).compile({
        ...(withId ? { $id: 'https://example.com/r5-ajv6-thrown.json' } : {}),
        type: 'object',
        properties: { name: { type: 'string', minLength: 3, remoteCheck: true } },
      } as never);
      await expect(validate({ name: 'x' })).rejects.toThrow('all down');
    });
});
