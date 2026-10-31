// Compare root declarations while evaluating the runtime member selected by indexed access.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

import { describePublicDeclarations } from './utils/evaluatedDeclarations/describePublicDeclarations.mjs';

const [baseline, candidate, output] = process.argv.slice(2).map((value) => path.resolve(value));
const require = createRequire(path.join(candidate, 'package.json'));
const ts = require('typescript');


const before = describePublicDeclarations(baseline, ts);
const after = describePublicDeclarations(candidate, ts);
const added = after.records.filter((record) => !before.records.includes(record));
const removed = before.records.filter((record) => !after.records.includes(record));
const exposures = [...before.traces, ...after.traces].filter((trace) => trace.wholeRuntimePaths.length || trace.exposedChangedMembers.length || trace.cadenceExposed);
const report = {
  method: 'Follow every root export through resolved aliases and declaration references. For FieldNodeRuntime indexed access, use the compiler-resolved literal key, compare the selected property declaration, and recursively follow its type; never substitute the entire runtime interface for one selected property. Any whole-runtime or changed-member exposure fails the gate.',
  publicExports: after.names.length,
  rootExportsEqual: JSON.stringify(before.names) === JSON.stringify(after.names),
  baselineReachableFiles: before.files.length,
  candidateReachableFiles: after.files.length,
  reachableSignatures: after.records.length,
  semanticDifferences: { added, removed },
  unsafeRuntimeExposures: exposures,
  unresolvedAliases: [...before.unresolved, ...after.unresolved],
  baselineRootTraces: before.traces,
  candidateRootTraces: after.traces,
  indexByteDifference: !fs.readFileSync(path.join(baseline, 'dist/index.d.ts')).equals(fs.readFileSync(path.join(candidate, 'dist/index.d.ts'))),
};
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
if (!report.rootExportsEqual || added.length || removed.length || exposures.length || report.unresolvedAliases.length) {
  console.error('IR6_EVALUATED_DECLARATIONS_DIFFER added=' + added.length + ' removed=' + removed.length + ' unsafe=' + exposures.length);
  process.exitCode = 1;
} else console.log('IR6_EVALUATED_DECLARATIONS_OK exports=' + after.names.length + ' signatures=' + after.records.length + ' public-root-traces=' + after.traces.length);
