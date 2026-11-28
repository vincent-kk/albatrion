import { expect, it } from 'vitest';

import { observeRouting } from './fixtures/routeOracle/observeRouting';
import type { UnionSelection } from './fixtures/routeOracle/readUnionSelection';
import {
  routeOracleScenarios,
  routeOracleShapes,
} from './fixtures/routeOracle/routeOracleShapes';
import { routeOracleValidators } from './fixtures/routeOracle/routeOracleValidators';

/** Shapes routed correctly whether references are inlined or compiled separately. */
const correctUnderEveryConfiguration = [
  'property oneOf',
  'items oneOf',
  'if then else in a recursive definition',
  'inline oneOf inside a branch',
  'root oneOf beside inline item oneOf',
];

/** Shapes routed correctly while the validator inlines their reference targets. */
const correctWhileInlined = [
  '$ref to $defs',
  '$ref to definitions',
  'one target at two properties',
  'tuple items inline and $ref',
  'prefixItems inline and $ref',
];

/** Issues the oracle reports over the proof shapes, so the agreement is not over empty sets. */
const inlinedTruthIssueCount = 64;

/** Issues over the shapes proven under separate compilation, which exclude the reference shapes. */
const separateTruthIssueCount = 40;

it.each(routeOracleValidators)(
  'agrees exactly with the routed issues on the correctly routed shapes under $name',
  async (config) => {
    const isSeparate = config.name.endsWith('-separate');
    const names = isSeparate
      ? correctUnderEveryConfiguration
      : [...correctUnderEveryConfiguration, ...correctWhileInlined];
    const truth: [string, readonly string[]][] = [];
    const shown: [string, readonly string[]][] = [];
    for (const shape of routeOracleShapes) {
      if (!names.includes(shape.name)) continue;
      if (shape.dialects && !shape.dialects.includes(config.dialect)) continue;
      for (const scenario of routeOracleScenarios) {
        const cell = `${shape.name} / ${scenario}`;
        const observation = await observeRouting(
          shape.schema(),
          shape.value(scenario),
          config,
        );
        truth.push([cell, observation.truth]);
        shown.push([cell, observation.shown]);
      }
    }
    expect(shown).toEqual(truth);
    expect(truth.reduce((count, [, issues]) => count + issues.length, 0)).toBe(
      isSeparate ? separateTruthIssueCount : inlinedTruthIssueCount,
    );
  },
);

/** Oracle selection that commits no branch anywhere. */
const keepEveryUnion: UnionSelection = () => undefined;

/** Oracle selection that commits the second branch everywhere, against the form's first. */
const commitOtherBranch: UnionSelection = () => 1;

it.each([
  ['keeps every union', keepEveryUnion],
  ['commits the other branch', commitOtherBranch],
] as const)('detects a dropped issue when the oracle %s', async (_, select) => {
  const shape = routeOracleShapes.find(
    (entry) => entry.name === 'property oneOf',
  );
  const ajv8 = routeOracleValidators.find((entry) => entry.name === 'ajv8');
  if (!shape || !ajv8) throw new Error('Proof shape or validator is missing');
  const observation = await observeRouting(
    shape.schema(),
    shape.value('both'),
    ajv8,
    select,
  );
  expect(observation.routing).toBe('false drop');
  expect(observation.shown).toEqual([
    '/u oneOf {"passingSchemas":null}',
    '/u/value minLength {"limit":3}',
  ]);
  expect(
    observation.truth.filter((key) => !observation.shown.includes(key)),
  ).toEqual([
    '/u/kind const {"allowedValue":"y"}',
    '/u/value pattern {"pattern":"^y"}',
  ]);
});
