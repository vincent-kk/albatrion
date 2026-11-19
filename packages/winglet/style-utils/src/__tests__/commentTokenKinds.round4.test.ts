import { describe, expect, it } from 'vitest';
import { compressCss } from '../index';
import { normalizeCss } from './helpers/normalizeCss';

const tokens = ['name', '12', '1px', '12%', '#name', '@name', '!', ' '];
describe('comment boundaries beside every ordinary token category', () => {
  for (const token of tokens) for (const position of ['before', 'inside', 'after']) {
    it(`${JSON.stringify(token)} ${position}`, () => {
      const marker = 'a/**/b';
      const body = position === 'before' ? marker + ' ' + token : position === 'after' ? token + ' ' + marker : 'a ' + token + ' ' + marker;
      const css = '.a{--x:' + body + '}';
      expect(normalizeCss(compressCss(css))).toEqual(normalizeCss(css));
    });
  }
});
