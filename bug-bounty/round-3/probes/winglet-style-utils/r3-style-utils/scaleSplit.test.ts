import { describe, expect, it } from 'vitest';

import { compressCss } from '../../index';
import { RuleScoper } from '../../styleManager/StyleManager/utils/RuleScoper';

const time = (run: () => unknown) => {
  const start = performance.now();
  run();
  return performance.now() - start;
};

describe('diagnostic: which pass grows super-linearly on a long sibling selector list', () => {
  it('measures RuleScoper and compressCss separately', () => {
    const rows: Record<string, number | string>[] = [];
    for (const size of [250, 500, 1000]) {
      const css = `${Array.from({ length: size }, (_, index) => `.a${index} + .b${index}`).join(', ')} { color: red; }`;
      const scoped = new RuleScoper(css, '.s').scopeSheet();
      rows.push({
        size,
        bytes: css.length,
        scoper: time(() => new RuleScoper(css, '.s').scopeSheet()).toFixed(1),
        compressRaw: time(() => compressCss(css)).toFixed(1),
        compressScoped: time(() => compressCss(scoped)).toFixed(1),
        compressNoPlus: time(() => compressCss(css.replaceAll(' + ', ' > '))).toFixed(1),
      });
    }
    console.info(JSON.stringify(rows));
    expect(rows.length).toBe(3);
  }, 60000);
});
