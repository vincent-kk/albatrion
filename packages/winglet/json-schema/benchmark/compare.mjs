// Invoked directly by Node; thresholds constrain measured cases, never sample selection.
import { parseArgs } from 'node:util';

import { assertFreshBuild, loadScanners } from './_lib.mjs';
import { compareBuilds } from './compare/compareBuilds.mjs';
import { createCases } from './compare/createCases.mjs';
import { evaluateComparison } from './compare/evaluateComparison.mjs';
import { selectCases } from './compare/selectCases.mjs';
import { summarizeGroups } from './compare/summarizeGroups.mjs';

try {
  const { values } = parseArgs({
    options: {
      baseline: { type: 'string' },
      groups: { type: 'string' },
      order: { type: 'string' },
      min: { type: 'string', default: '' },
      'max-slowdown': { type: 'string' },
      'max-speedup': { type: 'string' },
    },
  });
  if (!values.baseline) throw new Error('--baseline <dist> is required');
  const min = {};
  for (const item of values.min.split(',').filter(Boolean)) {
    const [group, value, extra] = item.split('=');
    if (
      !group ||
      extra !== undefined ||
      !Number.isFinite(Number(value)) ||
      Number(value) <= 0
    )
      throw new Error(`Invalid --min constraint: ${item}`);
    min[group] = Number(value);
  }
  const limits = { min };
  for (const [flag, key] of [
    ['max-slowdown', 'maxSlowdown'],
    ['max-speedup', 'maxSpeedup'],
  ]) {
    if (values[flag] === undefined) continue;
    const value = Number(values[flag]);
    if (!Number.isFinite(value) || value < 1)
      throw new Error(`Invalid --${flag}: ${values[flag]}`);
    limits[key] = value;
  }
  assertFreshBuild();
  const builds = await Promise.all([
    loadScanners(values.baseline),
    loadScanners(),
  ]);
  const cases = await compareBuilds(
    builds,
    selectCases(createCases(), values.groups, values.order),
  );
  const groups = summarizeGroups(cases);
  console.log(
    JSON.stringify(
      { ratio: 'baseline median / current median', cases, groups },
      null,
      2,
    ),
  );
  evaluateComparison(cases, limits);
  console.log('COMPARE_OK');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
