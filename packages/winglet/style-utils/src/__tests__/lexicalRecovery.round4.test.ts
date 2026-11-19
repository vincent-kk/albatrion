import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';

it.each([12, 24, 48])(
  'terminates repeated escaped EOF recovery with %i pairs',
  (size) => {
    const css = '(' + String.fromCharCode(34, 92).repeat(size);
    const component = pathToFileURL(
      resolve(__dirname, '../../dist/utils/cssTokens/getCssComponentEnd.mjs'),
    ).href;
    const closure = pathToFileURL(
      resolve(__dirname, '../../dist/utils/cssTokens/closeCssFragment.mjs'),
    ).href;
    const compressor = pathToFileURL(
      resolve(__dirname, '../../dist/utils/compressCss/compressCss.mjs'),
    ).href;
    const script = `import {getCssComponentEnd} from ${JSON.stringify(component)}; import {closeCssFragment} from ${JSON.stringify(closure)}; import {compressCss} from ${JSON.stringify(compressor)}; const css=${JSON.stringify(css)}; getCssComponentEnd(css,0); closeCssFragment(css); compressCss(css);`;
    const result = spawnSync(
      process.execPath,
      ['--single-threaded', '--input-type=module', '--eval', script],
      { timeout: 3000 },
    );
    expect(
      result.status,
      result.error?.message ?? result.stderr.toString(),
    ).toBe(0);
  },
);
