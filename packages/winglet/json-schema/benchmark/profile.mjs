// Invoked directly by Node --cpu-prof; --group selects the measured hot path.
import { parseArgs } from 'node:util';

import { loadScanners } from './_lib.mjs';
import { createCases } from './compare/createCases.mjs';
import { createWorkload } from './compare/createWorkload.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    group: { type: 'string', default: 'all' },
    case: { type: 'string' },
    build: { type: 'string' },
    rounds: { type: 'string' },
  },
});
const rounds = Number(values.rounds ?? positionals[0] ?? 200);
if (!Number.isSafeInteger(rounds) || rounds < 1)
  throw new Error('rounds must be a positive integer');
const scenarios = createCases().filter(
  (scenario) =>
    (values.group === 'all' || scenario.group === values.group) &&
    (values.case === undefined || scenario.name === values.case),
);
if (!scenarios.length) throw new Error('No matching profile cases');
const build = await loadScanners(values.build);
const workloads = scenarios.map((scenario) => createWorkload(build, scenario));
for (let round = 0; round < rounds; round++)
  for (const workload of workloads) await workload.run(workload.prepare(1), 0);
console.log(
  JSON.stringify({
    group: values.group,
    cases: scenarios.map((s) => s.name),
    rounds,
  }),
);
