import assert from 'node:assert/strict';
import path from 'node:path';

import { readConfig } from './readConfig.mjs';

/** Parse only local bundle/role flags here; retain the shared CLI's validation. */
export function readAlternatingConfig(argv) {
  const flags = {};
  const common = [];
  for (const argument of argv) {
    const match = /^--(baseline-bundle|candidate-bundle|lane)=(.+)$/.exec(
      argument,
    );
    if (!match) common.push(argument);
    else {
      assert.ok(!(match[1] in flags), `Duplicate ${match[1]}`);
      flags[match[1]] = match[2];
    }
  }
  if (!common.some((arg) => arg.startsWith('--runs=')))
    common.push('--runs=10');
  const config = readConfig(common, new URL('../', import.meta.url));
  assert.ok(config.runs >= 2 && config.runs % 2 === 0, 'Use an even run count');
  const formal = config.samples >= 100;
  if (formal)
    assert.ok(
      config.samples === 100 && config.warmups === 20 && config.runs === 10,
      'Formal alternating windows require 20 warmups, 100 samples, 10 processes per role',
    );
  if (config.worker) assert.ok(['A', 'B'].includes(flags.lane), 'Worker lane');
  else
    for (const name of ['baseline-bundle', 'candidate-bundle'])
      assert.ok(
        flags[name] &&
          path.isAbsolute(flags[name]) &&
          flags[name].endsWith('.mjs'),
        `Use an absolute local --${name}=...mjs`,
      );
  return { ...config, formal, ...flags };
}
