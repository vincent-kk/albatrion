import { run as runCompareJsonSchemaErrors } from './compareJsonSchemaErrors';

runCompareJsonSchemaErrors().then(
  ({ fastest, slowest, speedRatio, executionTimeSaved }) => {
    console.log(
      `fastest: ${fastest}, slowest: ${slowest}, speedRatio: ${speedRatio}:1, timeSaved: ${executionTimeSaved}%`,
    );
  },
);
