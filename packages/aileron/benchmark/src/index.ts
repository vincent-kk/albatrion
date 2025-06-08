import { main } from './helpers/cli';
import { run as runApplyPatch } from './targets/applyPatch/benchmark';
import { run as runClone } from './targets/clone/benchmark';
import { run as runCompare } from './targets/compare/benchmark';
import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';
import { run as runComparePatch } from './targets/comparePatch/benchmark';
import { run as runDeepMerge } from './targets/deepMerge/benchmark';
import { run as runEscapePointer } from './targets/escapePointer/benchmark';
import { run as runFind } from './targets/find/benchmark';
import { run as runGetJsonPaths } from './targets/getJsonPath/benchmark';
import { run as runGetObjectKeys } from './targets/getObjectKeys/benchmark';
import { run as runGetter } from './targets/getter/benchmark';
import { run as runSortObjectKeys } from './targets/sortObjectKeys/benchmark';
import { run as runStringifyObject } from './targets/stringifyObject/benchmark';

const benchmarks = {
  // fastest: 1162676.20, slowest: 582443.64, speedRatio: 2.00:1, timeSaved: 49.90%
  compareJsonSchemaErrors: runCompareJsonSchemaErrors,
  // fastest: 194722.56, slowest: 191773.18, speedRatio: 1.02:1, timeSaved: 1.51%
  deepMerge: runDeepMerge,
  // fastest: 1206271.38, slowest: 340044.93, speedRatio: 3.55:1, timeSaved: 71.81%
  find: runFind,
  // fastest: 594715.92, slowest: 118951.10, speedRatio: 5.00:1, timeSaved: 80.00%
  getJsonPaths: runGetJsonPaths,
  // fastest: 1123.40, slowest: 408.95, speedRatio: 2.75:1, timeSaved: 63.60%
  sortObjectKeys: runSortObjectKeys,
  // fastest(serialize): 64045091.33, slowest: 80672.09, speedRatio: 793.89:1, timeSaved: 99.87%
  stringifyObject: runStringifyObject,
  // fastest: 2222.87, slowest: 1195.36, speedRatio: 1.86:1, timeSaved: 46.22%
  clone: runClone,
  // fastest: 954274056.54, slowest: 949024019.24, speedRatio: 1.01:1, timeSaved: 0.55%
  getter: runGetter,
  // fastest: 740379.96, slowest: 84011.72, speedRatio: 8.81:1, timeSaved: 88.65%
  compare: runCompare,
  comparePatch: runComparePatch,
  getObjectKeys: runGetObjectKeys,
  escapePointer: runEscapePointer,
  applyPatch: runApplyPatch,
};

main(benchmarks).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
