import coreCases from '../../../fixtures/core-cases.json';
import type { CoreOptions } from '../optionTypes';

/**
 * Validate the small CLI surface before builds or measurements begin.
 * @param args - Flag/value pairs, accepting both --name value and --name=value.
 * @returns Validated options; throws on unknown cases, flags or invalid counts.
 */
export function parseCoreOptions(args: string[]): CoreOptions {
  const values: Record<string, string> = {};
  for (let index = 0; index < args.length; index++) {
    const [flag, inline] = args[index].split(/=(.*)/s);
    if (
      ![
        '--cases',
        '--runs',
        '--warmup',
        '--out',
        '--baseline',
        '--baseline-dir',
      ].includes(flag)
    )
      throw new Error(`Unknown option: ${flag}`);
    const value = inline ?? args[++index];
    if (!value || value.startsWith('--') || flag in values)
      throw new Error(`Missing or duplicate option: ${flag}`);
    values[flag] = value;
  }
  const runs = Number(values['--runs'] ?? 20);
  const warmup = Number(values['--warmup'] ?? 3);
  const cases = values['--cases']
    ? values['--cases'].split(',')
    : [...coreCases];
  if (
    !Number.isSafeInteger(runs) ||
    runs < 1 ||
    !Number.isSafeInteger(warmup) ||
    warmup < 0
  )
    throw new Error(
      'runs must be positive and warmup must be nonnegative integers',
    );
  if (
    !cases.length ||
    cases.some(
      (id, index) => !coreCases.includes(id) || cases.indexOf(id) !== index,
    )
  )
    throw new Error('cases must contain unique core case IDs');
  if (values['--baseline'] && values['--baseline-dir'])
    throw new Error('Choose --baseline or --baseline-dir');
  return {
    cases,
    runs,
    warmup,
    out: values['--out'] ?? 'results/core',
    baseline: values['--baseline'],
    baselineDir: values['--baseline-dir'],
  };
}
