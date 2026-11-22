import { expect, it } from 'vitest';
import { convertJSONPathToPointer, convertJSONPointerToPath, getValue } from '../index';

it('keeps empty-token paths equivalent to the pointers they address', () => {
  const document = { '': { x: 1 }, x: 2, a: { '': { b: 3 }, b: 4 } };
  for (const pointer of ['//x', '/a//b']) {
    const roundTrip = convertJSONPathToPointer(convertJSONPointerToPath(pointer));
    expect(roundTrip).toBe(pointer);
    expect(getValue(document, roundTrip)).toBe(getValue(document, pointer));
  }
});

it('round-trips 5000 seeded canonical pointer and data-path pairs in both directions', () => {
  const seed = 0x5ca110;
  let state = seed;
  const next = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state >>> 8; };
  const alphabet = ['', 'name', 'child', 'a_b', '$key', '0', '12', '-'];
  for (let trial = 0; trial < 5000; trial++) {
    const tokens = Array.from({ length: 2 + next() % 7 }, () => alphabet[next() % alphabet.length]);
    for (let index = 1; index < tokens.length; index++)
      if (tokens[index - 1] === '' && (/^\d+$/.test(tokens[index]) || tokens[index] === '-')) tokens[index] = 'child';
    const pointer = '/' + tokens.join('/');
    const path = '.' + tokens.map((token, index) => /^\d+$/.test(token) ? '[' + token + ']' : token === '-' ? '[]' : (index ? '.' : '') + token).join('');
    const label = `seed=${seed}, trial=${trial}, pointer=${pointer}, path=${path}`;
    expect(convertJSONPathToPointer(path), label).toBe(pointer);
    expect(convertJSONPointerToPath(pointer), label).toBe(path);
    expect(convertJSONPathToPointer(convertJSONPointerToPath(pointer)), label).toBe(pointer);
    expect(convertJSONPointerToPath(convertJSONPathToPointer(path)), label).toBe(path);
  }
});
