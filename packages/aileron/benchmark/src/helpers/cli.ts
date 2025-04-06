import inquirer from 'inquirer';

export async function main(benchmarks: Record<string, () => Promise<any>>) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Run all benchmarks', value: 'all' },
        ...Object.keys(benchmarks).map((name) => ({
          name: `Run [${name}] benchmark`,
          value: name,
        })),
      ],
    },
  ]);

  if (action === 'all') {
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

  const benchmark = benchmarks[action as keyof typeof benchmarks];
  if (!benchmark) {
    console.error(`Benchmark "${action}" not found.`);
    process.exit(1);
  }

  console.log(`Running ${action} benchmark...`);
  const result = await benchmark();
  console.log(
    `Result: fastest: ${result.fastest}, slowest: ${result.slowest}, speedRatio: ${result.speedRatio}:1, timeSaved: ${result.executionTimeSaved}%`,
  );
}
