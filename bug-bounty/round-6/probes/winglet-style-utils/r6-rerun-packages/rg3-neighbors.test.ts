import { expect, it } from 'vitest';
import { compressCss } from '@/style-utils';
import { significantTokens } from './r5-r5-style-react-modal/cssSyntax';
it('RG3: token boundaries survive signed decimal and exponent expression fragments', () => {
  for (const number of ['.5', '1e-7', '8px', '3%']) for (const sign of ['+', '-']) for (const separator of [' ', '/**/ ']) {
    const css = '.probe{--expression:1px ' + sign + separator + number + ';width:calc(var(--expression))}';
    expect(significantTokens(compressCss(css)), css).toEqual(significantTokens(css));
  }
});
