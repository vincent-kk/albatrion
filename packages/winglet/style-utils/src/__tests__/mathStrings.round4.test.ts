import { expect, it } from 'vitest';
import { compressCss } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

for (const token of ['")"', '";"', '"{"', '"}"', "')'", 'url(a;b)', '\\29 ', '[one]'])
  for (const operator of ['+', '-'])
    it(`round-4 math ${token} ${operator}`, () => {
      const css = `.a{width:calc(var(--a, ${token}) ${operator} 2px)}`;
      const output = compressCss(css);
      expect(output).toContain(` ${operator} 2px`);
      expect(normalizeCss(output)).toEqual(normalizeCss(css));
    });
