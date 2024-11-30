// NOTE: fastest: 1162676.20, slowest: 582443.64, speedRatio: 2.00:1, timeSaved: 49.90%\
// import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';
// runCompareJsonSchemaErrors().then(
//   ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//     console.log(
//       `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//     );
//   },
// );
// NOTE: fastest: 1206271.38, slowest: 340044.93, speedRatio: 3.55:1, timeSaved: 71.81%
// import { run as runFind } from './targets/find/benchmark';
// runFind().then(({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//   console.log(
//     `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//   );
// });
// NOTE: fastest: 242782.94, slowest: 226187.09, speedRatio: 1.07:1, timeSaved: 6.84%
// import { run as runGetDataWithSchema } from './targets/getDataWithSchema/benchmark';
// runGetDataWithSchema().then(
//   ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//     console.log(
//       `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//     );
//   },
// );
// NOTE: fastest: 594715.92, slowest: 118951.10, speedRatio: 5.00:1, timeSaved: 80.00%
// import { run as runGetJsonPaths } from './targets/getJsonPath/benchmark';
// runGetJsonPaths().then(
//   ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//     console.log(
//       `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//     );
//   },
// );
// NOTE: fastest: 1128561.73, slowest: 567012.23, speedRatio: 1.99:1, timeSaved: 49.76%
// import { run as runTransformErrors } from './targets/transformErrors/benchmark';
// runTransformErrors().then(
//   ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//     console.log(
//       `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//     );
//   },
// );
// import { run as runStringifyObject } from './targets/stringiftyObject/benchmark';
// runStringifyObject().then(
//   ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//     console.log(
//       `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//     );
//   },
// );
import { run as runDeepMerge } from './targets/deepMerge/benchmark';

runDeepMerge().then(({ fastest, slowest, speedRatio, executionTimeSaved }) => {
  console.log(
    `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
  );
});
