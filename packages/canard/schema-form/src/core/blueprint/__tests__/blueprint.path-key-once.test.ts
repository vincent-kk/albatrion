import { afterEach, describe, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';
import type { BlueprintSchema } from '../type';
import * as templateKeys from '../utils/analyze/getTemplateKey';
import { captureOwnedInlineObservables } from './fixtures/captureOwnedInlineObservables';
import { getTemplateKeysHead } from './fixtures/getTemplateKeysHead';
import headFixture from './fixtures/ownedInlineHead.json';
import mounts from './fixtures/ownedInlineMounts.json';

afterEach(() => vi.restoreAllMocks());

describe('tuple key construction', () => {
  it('preserves the actual lookup keys and all paths of the 59 owned-inline schemas', () => {
    const original = templateKeys.getTemplateKey;
    const checked = new WeakSet<object>();
    const expected = new WeakMap<object, { key: string; boundKey: string }>();
    let lookups = 0;
    vi.spyOn(templateKeys, 'getTemplateKey').mockImplementation((context, inputs) => {
      const reference = getTemplateKeysHead(context, inputs);
      expected.set(context, reference);
      if (!checked.has(context)) {
        checked.add(context);
        const templateGet = context.templates.get.bind(context.templates);
        const constructingGet = context.constructing.get.bind(context.constructing);
        vi.spyOn(context.templates, 'get').mockImplementation((key) => {
          expect(key).toBe(expected.get(context)?.boundKey);
          lookups++;
          return templateGet(key);
        });
        vi.spyOn(context.constructing, 'get').mockImplementation((key) => {
          expect(key).toBe(expected.get(context)?.key);
          return constructingGet(key);
        });
      }
      const actual: unknown = original(context, inputs);
      expect(typeof actual === 'string' ? actual : (actual as { key: string }).key)
        .toBe(reference.key);
      if (typeof actual !== 'string')
        expect((actual as { boundKey: string }).boundKey).toBe(reference.boundKey);
      return actual as ReturnType<typeof original>;
    });
    expect(headFixture.cases).toHaveLength(59);
    for (const sample of headFixture.cases) {
      for (let collect = 0; collect < 2; collect++) {
        expect(captureOwnedInlineObservables(
          structuredClone(sample.schema) as BlueprintSchema, collect === 1,
        ), `${sample.label}: collect=${collect}`).toEqual(sample.captures[collect]);
      }
    }
    expect(lookups).toBeGreaterThan(118);
  });

  it('counts tuple constructions and whole-key re-encoding against HEAD per node', () => {
    const original = templateKeys.getTemplateKey;
    const stringify = JSON.stringify;
    let calls = 0;
    let reencoded = 0;
    let referenceEncodings = 0;
    let measuringReference = false;
    let tupleResult = false;
    let measuringKey = false;
    let wholeKeyEncodings = 0;
    vi.spyOn(templateKeys, 'getTemplateKey').mockImplementation((context, inputs) => {
      calls++;
      measuringReference = true;
      const reference = getTemplateKeysHead(context, inputs);
      measuringReference = false;
      measuringKey = true;
      const result: unknown = original(context, inputs);
      measuringKey = false;
      tupleResult = typeof result !== 'string';
      expect(tupleResult ? result : { key: result, boundKey: reference.boundKey })
        .toEqual(reference);
      return result as ReturnType<typeof original>;
    });
    vi.spyOn(JSON, 'stringify').mockImplementation((value, ...rest) => {
      if (measuringReference) referenceEncodings++;
      else if (typeof value === 'object' && value !== null &&
        typeof value[0] === 'string' && value[0].startsWith('[[')) {
        reencoded++;
        wholeKeyEncodings++;
      } else if (measuringKey && typeof value !== 'string') wholeKeyEncodings++;
      return stringify(value, ...rest);
    });
    for (const fixture of mounts) {
      calls = 0;
      reencoded = 0;
      referenceEncodings = 0;
      wholeKeyEncodings = 0;
      const result = blueprint(structuredClone(fixture.schema) as BlueprintSchema);
      expect(calls, fixture.name).toBe(result.nodes.length);
      expect(referenceEncodings, fixture.name).toBe(2 * result.nodes.length);
      expect(reencoded, fixture.name).toBe(tupleResult ? 0 : result.nodes.length);
      expect(wholeKeyEncodings, fixture.name).toBe(tupleResult ? 0 : 2 * result.nodes.length);
      console.log('PATH105', JSON.stringify({ fixture: fixture.name, nodes: result.nodes.length,
        tupleTraversalsBefore: calls, tupleTraversalsAfter: calls,
        wholeKeyEncodingsBefore: referenceEncodings, wholeKeyEncodingsAfter: wholeKeyEncodings,
        hostKeyReencodingsBefore: calls, hostKeyReencodingsAfter: reencoded,
        producedKeysBefore: 2 * calls, producedKeysAfter: 2 * calls }));
    }
  });
});
