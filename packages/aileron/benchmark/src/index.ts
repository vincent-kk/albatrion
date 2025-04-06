import { main } from './helpers/cli';
import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';
import { run as runDeepMerge } from './targets/deepMerge/benchmark';
import { run as runFind } from './targets/find/benchmark';
import { run as runGetDataWithSchema } from './targets/getDataWithSchema/benchmark';
import { run as runGetJsonPaths } from './targets/getJsonPath/benchmark';
import { run as runSortObjectKeys } from './targets/sortObjectKeys/benchmark';
import { run as runStringifyObject } from './targets/stringifyObject/benchmark';
import { run as runTransformErrors } from './targets/transformErrors/benchmark';

const benchmarks = {
  // fastest: 1162676.20, slowest: 582443.64, speedRatio: 2.00:1, timeSaved: 49.90%
  compareJsonSchemaErrors: runCompareJsonSchemaErrors,
  // fastest: 194722.56, slowest: 191773.18, speedRatio: 1.02:1, timeSaved: 1.51%
  deepMerge: runDeepMerge,
  // fastest: 1206271.38, slowest: 340044.93, speedRatio: 3.55:1, timeSaved: 71.81%
  find: runFind,
  // fastest: 242782.94, slowest: 226187.09, speedRatio: 1.07:1, timeSaved: 6.84%
  getDataWithSchema: runGetDataWithSchema,
  // fastest: 594715.92, slowest: 118951.10, speedRatio: 5.00:1, timeSaved: 80.00%
  getJsonPaths: runGetJsonPaths,
  // Result: fastest: 1123.40, slowest: 408.95, speedRatio: 2.75:1, timeSaved: 63.60%
  sortObjectKeys: runSortObjectKeys,
  // fastest(serialize): 64045091.33, slowest: 80672.09, speedRatio: 793.89:1, timeSaved: 99.87%
  stringifyObject: runStringifyObject,
  // fastest: 1128561.73, slowest: 567012.23, speedRatio: 1.99:1, timeSaved: 49.76%
  transformErrors: runTransformErrors,
};

main(benchmarks).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
