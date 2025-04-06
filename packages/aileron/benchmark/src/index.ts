import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';
import { run as runDeepMerge } from './targets/deepMerge/benchmark';
import { run as runFind } from './targets/find/benchmark';
import { run as runGetDataWithSchema } from './targets/getDataWithSchema/benchmark';
import { run as runGetJsonPaths } from './targets/getJsonPath/benchmark';
import { run as runSortObjectKeys } from './targets/sortObjectKeys/benchmark';
import { run as runStringifyObject } from './targets/stringifyObject/benchmark';
import { run as runTransformErrors } from './targets/transformErrors/benchmark';

runDeepMerge().then(({ fastest, slowest, speedRatio, executionTimeSaved }) => {
  console.log(
    `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
  );
});

// NOTE: Fastest is serialize
// NOTE: fastest: 64045091.33, slowest: 80672.09, speedRatio: 793.89:1, timeSaved: 99.87%
runStringifyObject().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);

// NOTE: fastest: 1128561.73, slowest: 567012.23, speedRatio: 1.99:1, timeSaved: 49.76%
runTransformErrors().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);

// NOTE: fastest: 594715.92, slowest: 118951.10, speedRatio: 5.00:1, timeSaved: 80.00%
runGetJsonPaths().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);

// NOTE: fastest: 242782.94, slowest: 226187.09, speedRatio: 1.07:1, timeSaved: 6.84%
runGetDataWithSchema().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);

// NOTE: fastest: 1206271.38, slowest: 340044.93, speedRatio: 3.55:1, timeSaved: 71.81%
runFind().then(({ fastest, slowest, speedRatio, executionTimeSaved }) => {
  console.log(
    `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
  );
});

// NOTE: fastest: 1162676.20, slowest: 582443.64, speedRatio: 2.00:1, timeSaved: 49.90%
runCompareJsonSchemaErrors().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);

runSortObjectKeys().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);
