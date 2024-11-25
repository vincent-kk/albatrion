import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';

runCompareJsonSchemaErrors().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);
