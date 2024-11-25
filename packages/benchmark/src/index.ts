// import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';
// import { run as runFind } from './targets/find/benchmark';
import { run as runGetDataWithSchema } from './targets/getDataWithSchema/benchmark';

// runCompareJsonSchemaErrors().then(
//   ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//     console.log(
//       `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//     );
//   },
// );
// runFind().then(({ fastest, slowest, speedRatio, executionTimeSaved }) => {
//   console.log(
//     `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
//   );
// });
runGetDataWithSchema().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);
