import { describe, expect, it } from 'vitest';
import { convertJSONPointerToPath, getJSONPath } from '../index';

/** The documented legacy spelling for each token kind, independently of the scanner. */
const spellings = [
  { token: '', first: '', next: '.' },
  { token: 'x', first: 'x', next: '.x' },
  { token: '0', first: '[0]', next: '[0]' },
  { token: '-', first: '[]', next: '[]' },
  { token: 'a.b', first: '[a.b]', next: '[a.b]' },
  { token: '[0]', first: '[0]', next: '.[0]' },
];

describe('round-4 pointer token spelling table', () => {
  for (const first of spellings)
    it(`first token ${JSON.stringify(first.token)}, lengths one to three`, () => {
      expect(convertJSONPointerToPath('/' + first.token)).toBe('.' + first.first);
      for (const second of spellings) {
        const pointer = '/' + first.token + '/' + second.token;
        const expected = '.' + first.first + second.next;
        expect(convertJSONPointerToPath(pointer)).toBe(expected);
        for (const third of spellings)
          expect(convertJSONPointerToPath(pointer + '/' + third.token)).toBe(expected + third.next);
      }
    });

  it.each([
    ['root and empty key', '', '/'],
    ['numeric and bracket token', '/0', '/[0]'],
    ['append and bracket token', '/-', '/[]'],
    ['dot token and bracket-containing name', '/a.b/c.d', '/a.b][c.d'],
    ['empty token before numeric token', '/0', '//0'],
  ])('documented lossy limit: %s', (_name, left, right) => {
    expect(left).not.toBe(right);
    expect(convertJSONPointerToPath(left)).toBe(convertJSONPointerToPath(right));
  });

  for (const first of ['', 'x', '0'])
    it(`getJSONPath shared spelling with first token ${JSON.stringify(first)}`, () => {
      for (const second of ['', 'x', '0'])
        for (const third of ['', 'x', '0']) {
          const tokens = [first, second, third];
          const target = {};
          let root: object = target;
          for (const token of [...tokens].reverse()) root = token === '0' ? [root] : { [token]: root };
          const found = getJSONPath(root, target)?.slice(1) ?? '';
          const normalized = found.startsWith('.') ? found : '.' + found;
          expect(convertJSONPointerToPath('/' + tokens.join('/'))).toBe(normalized);
        }
    });
});
