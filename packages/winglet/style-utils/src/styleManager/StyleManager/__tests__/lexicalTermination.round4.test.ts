import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';

it.each(['', '{x:y'])('terminates on repeated URL tokens before an unfinished rule: %s', suffix => {
  const module = pathToFileURL(resolve(__dirname, '../../../../dist/styleManager/StyleManager/utils/RuleScoper.mjs')).href;
  const css = 'url(a)'.repeat(30) + suffix;
  const code = `import { RuleScoper } from ${JSON.stringify(module)}; new RuleScoper(${JSON.stringify(css)}, '.s').scopeSheet();`;
  const result = spawnSync(process.execPath, ['--single-threaded', '--input-type=module', '--eval', code], { timeout: 3000 });
  expect(result.status, result.error?.message).toBe(0);
});
