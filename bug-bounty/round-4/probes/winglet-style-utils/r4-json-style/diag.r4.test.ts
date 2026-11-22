import { describe, expect, it } from 'vitest';

import { compressCss } from '../../utils/compressCss/compressCss';
import { n1, n2 } from './oracle';

const firstDiff = (a: string[], b: string[]) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return { at: i, in: b.slice(Math.max(0, i - 3), i + 3), out: a.slice(Math.max(0, i - 3), i + 3) };
};

describe('diag', () => {
  it('D1 first token difference for small compressCss inputs', () => {
    const cases = [
      '.a{color:red !important}',
      '.a{content: "\\"/*"}',
      '.a{content: "\\31 0"}',
      '.a{width: calc(1px + 2px)}',
      '.a{content: "\\22"}',
      '.e\\e9 {color:red}',
      '.a\\31 , .b{}',
      '.a{--x: 1px}',
      '.a{background: url(a.png)}',
      '.a{transition: all .2s ease-in-out}',
      '.a{grid-area: 1 / 2}',
    ];
    const out = cases.map((css) => {
      const c = compressCss(css);
      const d1 = firstDiff(n1(c), n1(css));
      return { css, c, same1: JSON.stringify(n1(c)) === JSON.stringify(n1(css)), d1: d1.at < Math.max(n1(c).length, n1(css).length) ? d1 : null, same2: JSON.stringify(n2(c)) === JSON.stringify(n2(css)), n2in: n2(css), n2out: n2(c) };
    });
    expect(out.filter((o) => !o.same1 || !o.same2)).toEqual([]);
  });
});
