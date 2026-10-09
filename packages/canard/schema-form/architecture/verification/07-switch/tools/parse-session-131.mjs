import assert from 'node:assert/strict';

/** Parse the session CLI; reject incomplete, duplicate and unknown options before any measurement. */
export function parseSession131(argv) {
  const names = ['kind', 'lane', 'base', 'candidate', 'rows', 'blocks', 'out', 'touch-counts', 'reduced-blocks',
    'forms-per-process', 'warmup', 'samples', 'aa', 'first-report', 'axis-from', 'budget-seconds', 'smoke', 'swap'];
  const values = {};
  for (let index = 0; index < argv.length; index++) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(argv[index]);
    assert(match && names.includes(match[1]), `Unknown argument: ${argv[index]}`);
    const name = match[1];
    assert(!(name in values), `Duplicate argument: --${name}`);
    const value = match[2] ?? (['smoke', 'swap'].includes(name) ? true : argv[++index]);
    assert(value !== undefined && value !== '' && !String(value).startsWith('--'), `Missing value: --${name}`);
    values[name] = value;
  }
  for (const name of ['kind', 'lane', 'base', 'candidate', 'rows', 'out']) assert(values[name], `Required: --${name}`);
  assert(['aa', 'verdict', 'confirm'].includes(values.kind), '--kind must be aa, verdict or confirm');
  assert(['core', 'react'].includes(values.lane), '--lane must be core or react');
  const number = (name, fallback, minimum) => {
    const value = Number(values[name] ?? fallback);
    assert(Number.isSafeInteger(value) && value >= minimum, `Invalid --${name}: ${value}`);
    return value;
  };
  const blocks = number('blocks', 24, 2), budgetSeconds = number('budget-seconds', 7100, 1);
  assert(budgetSeconds < 7200, 'Session budget must be under two hours');
  assert(values.smoke === undefined || values.smoke === true, '--smoke takes no value');
  assert(values.swap === undefined || values.swap === true, '--swap takes no value');
  assert(!values.swap || values.kind === 'aa', '--swap is allowed only for kind aa');
  if (values.kind !== 'aa') assert(values.aa, 'verdict and confirm require --aa <A/A report>');
  if (values.kind === 'confirm') assert(values['first-report'], 'confirm requires --first-report <first report>');
  if (values.kind !== 'aa' && !values.smoke) assert(blocks === 24, 'Verdict/confirm full rows require 24 blocks; use --smoke for tool checks');
  return { kind: values.kind, lane: values.lane, base: values.base, candidate: values.candidate, rows: values.rows,
    out: values.out, blocks, reducedBlocks: Math.min(blocks, number('reduced-blocks', 8, 2)),
    formsPerProcess: number('forms-per-process', 1, 1), warmup: number('warmup', 20, 0), samples: number('samples', 41, 1),
    touchCounts: values['touch-counts'], aa: values.aa, firstReport: values['first-report'], axisFrom: values['axis-from'],
    budgetSeconds, smoke: Boolean(values.smoke), swap: Boolean(values.swap) };
}
