import { describe, expect, it } from 'vitest';

import { FormErrorCode } from '@/schema-form/errors';

import { createSeedSampler } from '../fixtures/createSeedSampler';
import {
  GATE_KINDS,
  GATE_POSITIONS,
  generateOracleCase,
} from './fixtures/generateOracleCase';
import { type OracleResult, runOracleCase } from './fixtures/runOracleCase';
import type { OracleCase } from './fixtures/types';

/*
 * The gate binding oracle: after the load and after every step, a generated form reads as a
 * fresh form loaded with its stored sources. A one-direction mismatch is a failure of the property;
 * a cyclic form must still settle or throw the budget error, and its mismatches are recorded apart.
 * Recorded mismatching seeds keep the check exact: a seed that stops differing, or a new one, fails it.
 */

/** Last seed of the full range. */
const TOTAL = 3000;

/**
 * One-direction seeds of the full range that differ from a fresh load. Each is the same difference:
 * after an array method inside a batch, an empty string item of a string array reads output `null`
 * where a fresh load reads it omitted (reduced: `{ arr: [''] }`, `root.batch(() => arr.remove(1))`).
 */
const ONE_DIRECTION_MISMATCHES = [601, 775, 1053, 1398, 1600, 1659, 2514];

/** Cyclic seeds of the full range that differ from a fresh load; the same array item difference. */
const CYCLIC_MISMATCHES = [394, 1755, 2841];

/** The first seed whose form is `if: { required: ['t'] }` with a `then` that turns off `t`'s `omitEmpty`. */
const OMIT_EMPTY_CYCLE_SEED = 66;

/** Codes a run may throw; only forms with a computed read throw a code other than the budget error (not reduced yet). */
const ALLOWED_THROWN = [
  FormErrorCode.BudgetExceeded,
  FormErrorCode.ExpressionThrew,
  FormErrorCode.MultipleErrors,
];

const CLASSES = GATE_KINDS.flatMap((gate) =>
  GATE_POSITIONS.map((position) => `${gate}/${position}`),
);
const sampler = createSeedSampler(TOTAL, CLASSES, 1);

/** One generated case with what its run showed. */
interface OracleRun {
  oracleCase: OracleCase;
  result: OracleResult;
}

/** The seeds of `runs` that differ from a fresh load, with their first mismatch for the failure message. */
const listMismatches = (runs: readonly OracleRun[]) =>
  runs
    .filter(({ result }) => result.mismatches.length > 0)
    .map(({ oracleCase, result }) => ({
      seed: oracleCase.seed,
      first: result.mismatches[0],
    }));

describe('gate binding oracle', () => {
  it(`generated forms read as a fresh load after every step (${sampler.label})`, () => {
    const runs: OracleRun[] = [];
    for (let seed = 1; sampler.has(seed); seed++) {
      const oracleCase = generateOracleCase(seed);
      if (!sampler.accept(oracleCase.sampleClass)) continue;
      runs.push({ oracleCase, result: runOracleCase(oracleCase) });
    }
    expect(sampler.shortfall()).toEqual([]);
    const ran = runs.map(({ oracleCase }) => oracleCase.seed);
    const oneDirection = listMismatches(
      runs.filter(({ oracleCase }) => !oracleCase.isCyclic),
    );
    expect(
      oneDirection.map(({ seed }) => seed),
      JSON.stringify(oneDirection),
    ).toEqual(ONE_DIRECTION_MISMATCHES.filter((seed) => ran.includes(seed)));
    const cyclic = listMismatches(
      runs.filter(({ oracleCase }) => oracleCase.isCyclic),
    );
    expect(
      cyclic.map(({ seed }) => seed),
      JSON.stringify(cyclic),
    ).toEqual(CYCLIC_MISMATCHES.filter((seed) => ran.includes(seed)));
    const unexpectedThrows = runs.flatMap(({ oracleCase, result }) =>
      result.thrown
        .filter(
          (thrown) =>
            !ALLOWED_THROWN.some((code) => thrown.endsWith(code)) ||
            (oracleCase.read !== 'computed' &&
              !thrown.endsWith(FormErrorCode.BudgetExceeded)),
        )
        .map((thrown) => `${oracleCase.seed} ${thrown}`),
    );
    expect(unexpectedThrows).toEqual([]);
  }, 300_000);

  it('generates the omitEmpty cycle form, and reads it as a fresh load', () => {
    const oracleCase = generateOracleCase(OMIT_EMPTY_CYCLE_SEED);
    expect(oracleCase).toMatchObject({
      gate: 'if-required',
      position: 'root',
      declaration: 'omit-empty',
      read: 'presence',
      isCyclic: true,
    });
    expect(runOracleCase(oracleCase)).toEqual({ mismatches: [], thrown: [] });
  });

  it('reports the recorded difference of an omitEmpty option two levels below a gate', () => {
    const result = runOracleCase({
      schema: {
        type: 'object',
        properties: {
          o: {
            type: 'object',
            properties: {
              p: { type: 'object', properties: { x: { type: 'string' } } },
            },
          },
        },
        if: { required: ['o'] },
        then: {
          properties: {
            o: { properties: { p: { options: { omitEmpty: false } } } },
          },
        },
      },
      load: { o: { p: { x: 'a' } } },
      steps: [{ kind: 'set', path: '/o/p/x', value: undefined }],
    });
    expect(result.mismatches.map(({ step }) => step)).toEqual([0]);
  });
});
