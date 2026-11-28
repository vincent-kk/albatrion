import { describeThrown } from '../../../../__tests__/boundary-scenes/fixtures/utils/describeThrown';
import { readRawSources } from '../../../../__tests__/boundary-scenes/fixtures/utils/readRawSources';
import { startSceneRun } from '../../../../__tests__/boundary-scenes/fixtures/utils/startSceneRun';
import { applyOracleStep } from './applyOracleStep';
import {
  type OracleNodeReading,
  observeOracleNodes,
} from './observeOracleNodes';
import type { OracleCase } from './types';

/** What one generated run showed. */
export interface OracleResult {
  /** Per step that differed from a fresh load (`-1` is the load): the lines only the live form or only the fresh form has. */
  mismatches: { step: number; live: string[]; fresh: string[] }[];
  /** `<step> <code or message>` of every thrown error, the fresh loads' included; skipped addresses are left out. */
  thrown: string[];
}

/**
 * Load a generated case and, after the load and after every step, compare the observation of the
 * live form with the observation of a fresh form loaded with the live form's stored sources.
 * A step whose address has no fitting node is skipped; any other thrown error is recorded and the run goes on.
 * @param oracleCase - The form, its load and its steps (a generated case or a directed scene)
 * @returns The mismatches and thrown errors
 */
export const runOracleCase = (
  oracleCase: Pick<OracleCase, 'schema' | 'load' | 'steps'>,
): OracleResult => {
  const scene = { schema: oracleCase.schema };
  const run = startSceneRun(scene, structuredClone(oracleCase.load));
  const result: OracleResult = {
    mismatches: [],
    thrown: run.thrownErrors.map((error) => `-1 ${error}`),
  };
  const compare = (step: number) => {
    const fresh = startSceneRun(scene, readRawSources(run.root));
    result.thrown.push(
      ...fresh.thrownErrors.map((error) => `${step} fresh ${error}`),
    );
    const live = differingLines(
      observeOracleNodes(run.root),
      observeOracleNodes(fresh.root),
    );
    const freshOnly = differingLines(
      observeOracleNodes(fresh.root),
      observeOracleNodes(run.root),
    );
    if (live.length > 0 || freshOnly.length > 0)
      result.mismatches.push({ step, live, fresh: freshOnly });
  };
  compare(-1);
  oracleCase.steps.forEach((step, index) => {
    try {
      applyOracleStep(run, step);
    } catch (error) {
      const described = describeThrown(error);
      if (!/^no (node|array) at /.test(described))
        result.thrown.push(`${index} ${described}`);
    }
    compare(index);
  });
  return result;
};

/** The lines of `own` that `other` lacks; a node with an omitted output that `other` lacks entirely is a documented difference and is left out. */
const differingLines = (
  own: readonly OracleNodeReading[],
  other: readonly OracleNodeReading[],
): string[] =>
  own
    .filter((reading) => !other.some((peer) => peer.line === reading.line))
    .filter(
      (reading) =>
        !(
          reading.isOmitted && !other.some((peer) => peer.path === reading.path)
        ),
    )
    .map((reading) => reading.line);
