import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { it } from 'vitest';

import { RuleScoper } from '../../styleManager/StyleManager/utils/RuleScoper';
import { compressCss } from '../../utils/compressCss/compressCss';
import { mulberry32, significantTokens } from './cssSyntax';
import { sheet } from './generate';
import { refScope } from './r4Oracle';

it('explore: RuleScoper against the round-4 token-level reference scoper', () => {
  const random = mulberry32(0xabcd);
  const failures: string[] = [];
  let checked = 0, skipped = 0, compressFail = 0;
  for (let n = 0; n < 4000; n++) {
    const css = sheet(random);
    let expected: string;
    try {
      expected = refScope(css, '.s');
    } catch {
      skipped++;
      continue;
    }
    checked++;
    const actual = new RuleScoper(css, '.s').scopeSheet();
    const a = significantTokens(expected), b = significantTokens(actual);
    if (JSON.stringify(a) !== JSON.stringify(b) && failures.length < 20) {
      let i = 0;
      while (a[i] === b[i]) i++;
      failures.push(JSON.stringify({ css, expected, actual, at: i, a: a.slice(Math.max(0, i - 4), i + 4), b: b.slice(Math.max(0, i - 4), i + 4) }));
    }
    const c = significantTokens(compressCss(actual));
    if (JSON.stringify(c) !== JSON.stringify(b)) compressFail++;
  }
  writeFileSync(join(tmpdir(), 'r5srm-scoper.txt'), `checked ${checked} skipped ${skipped} compressFail ${compressFail} failing ${failures.length}\n` + failures.join('\n'));
});
