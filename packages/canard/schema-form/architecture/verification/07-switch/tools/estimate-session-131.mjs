/** Extrapolate measured per-form stage costs to 24/8 scoped blocks at warmup 20/sample 41; this is not a timing judgment. */
export function estimateSession131(processes, rows, measuredOptions) {
  const warmup = measuredOptions.targetWarmup ?? 20, samples = measuredOptions.targetSamples ?? 41;
  const settings = [];
  for (const row of rows) {
    const key = `${row.fixture}/${row.validation}`;
    const setting = settings.find(item => item.key === key);
    if (setting) setting.blocks = Math.max(setting.blocks, row.blocks);
    else settings.push({ key, fixture: row.fixture, blocks: row.blocks });
  }
  const fixtures = settings.map(setting => {
    const forms = processes.flatMap(process => process.forms).filter(form => `${form.fixture}/${form.validation}` === setting.key);
    const average = name => forms.reduce((sum, form) => sum + (form.time[name] ?? 0), 0) / Math.max(1, forms.length);
    const warmScale = measuredOptions.warmup ? warmup / measuredOptions.warmup : 0;
    const sampleScale = samples / measuredOptions.samples;
    const fixed = Math.max(0, average('formElapsedMs') + average('launchBeforeFormMs') - average('warmupMs') - average('sampleMs'));
    const totalMs = setting.blocks * 2 * (fixed + average('warmupMs') * warmScale + average('sampleMs') * sampleScale);
    return { ...setting, totalMs, measuredFormRuns: forms.length, observedMeanMs: average('formElapsedMs') };
  }).sort((a, b) => b.totalMs - a.totalMs);
  let targetProcesses = 0;
  for (let block = 0; block < Math.max(...settings.map(setting => setting.blocks)); block++)
    targetProcesses += 2 * Math.ceil(settings.filter(setting => setting.blocks > block).length / measuredOptions.formsPerProcess);
  const modeledObservedMs = processes.flatMap(process => process.forms).reduce((sum, form) => sum + form.time.formElapsedMs + (form.time.launchBeforeFormMs ?? 0), 0);
  const fixedReportMs = measuredOptions.observedReportMs ?? 0;
  const driverPerProcessMs = measuredOptions.driverPerProcessMs ?? Math.max(0, (measuredOptions.observedSessionMs ?? modeledObservedMs) - modeledObservedMs - fixedReportMs) / Math.max(1, processes.length);
  const driverOverheadMs = driverPerProcessMs * targetProcesses + fixedReportMs;
  return { totalMs: fixtures.reduce((sum, fixture) => sum + fixture.totalMs, 0) + driverOverheadMs,
    driverOverheadMs, targetProcesses, fixtures, fullBlocks: measuredOptions.targetFullBlocks ?? 24, reducedBlocks: measuredOptions.targetReducedBlocks ?? 8,
    warmup, samples, includesConfirmation: false,
    limitation: 'Linear stage extrapolation from smoke, no timing judgment; GC/JIT and fixture coupling may change costs. Missing warmup is not extrapolatable.',
    complete: (warmup === 0 || measuredOptions.warmup > 0) && fixtures.every(fixture => fixture.measuredFormRuns > 0) };
}
