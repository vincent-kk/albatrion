import { Command } from 'commander';

import { run as runCompareJsonSchemaErrors } from './targets/compareJsonSchemaErrors/benchmark';
import { run as runDeepMerge } from './targets/deepMerge/benchmark';
import { run as runFind } from './targets/find/benchmark';
import { run as runGetDataWithSchema } from './targets/getDataWithSchema/benchmark';
import { run as runGetJsonPaths } from './targets/getJsonPath/benchmark';
import { run as runSortObjectKeys } from './targets/sortObjectKeys/benchmark';
import { run as runStringifyObject } from './targets/stringifyObject/benchmark';
import { run as runTransformErrors } from './targets/transformErrors/benchmark';

const benchmarks = {
  'compare-json-schema-errors': runCompareJsonSchemaErrors,
  'deep-merge': runDeepMerge,
  find: runFind,
  'get-data-with-schema': runGetDataWithSchema,
  'get-json-paths': runGetJsonPaths,
  'sort-object-keys': runSortObjectKeys,
  'stringify-object': runStringifyObject,
  'transform-errors': runTransformErrors,
};

const program = new Command();

program
  .name('benchmark-cli')
  .description('CLI tool for running benchmarks')
  .version('1.0.0');

program
  .command('list')
  .description('List all available benchmarks')
  .action(() => {
    console.log('Available benchmarks:');
    Object.keys(benchmarks).forEach((name) => {
      console.log(`- ${name}`);
    });
  });

program
  .command('run')
  .description('Run a specific benchmark')
  .argument('<name>', 'Name of the benchmark to run')
  .action(async (name: string) => {
    if (name === 'all') {
      console.log('Running all benchmarks...\n');
      for (const [benchmarkName, benchmarkFn] of Object.entries(benchmarks)) {
        console.log(`Running ${benchmarkName}...`);
        const result = await benchmarkFn();
        console.log(
          `Result: fastest: ${result.fastest}, slowest: ${result.slowest}, speedRatio: ${result.speedRatio}:1, timeSaved: ${result.executionTimeSaved}%\n`,
        );
      }
      return;
    }

    const benchmark = benchmarks[name as keyof typeof benchmarks];
    if (!benchmark) {
      console.error(
        `Benchmark "${name}" not found. Use "list" command to see available benchmarks.`,
      );
      process.exit(1);
    }

    const result = await benchmark();
    console.log(
      `Result: fastest: ${result.fastest}, slowest: ${result.slowest}, speedRatio: ${result.speedRatio}:1, timeSaved: ${result.executionTimeSaved}%`,
    );
  });

program.parse();
