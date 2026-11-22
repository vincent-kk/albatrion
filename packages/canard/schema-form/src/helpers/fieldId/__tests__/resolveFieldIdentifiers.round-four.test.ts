import { expect, it } from 'vitest';
import { resolveFieldIdentifiers } from '../resolveFieldIdentifiers';

it('separates primary, title and arbitrary stringified keys without HTML whitespace', () => {
  const keys = ['', '*', '%2A', '.', '%2E', 'a', '~', '/', '~input', 'a b', '\0', '\r', '\ud800', 0, -1, 0.5, NaN, Infinity];
  const fields = ['/plan', '/plan-1', '/name', '/name-label', '/first name', '/~0', '/~1'];
  const ids = fields.flatMap(path => {
    const ids = resolveFieldIdentifiers('scope', path);
    expect(ids.getInputId(1)).toBe(ids.getInputId('1'));
    return [ids.inputId, ids.labelId, ...keys.map(ids.getInputId)];
  });
  expect(new Set(ids).size).toBe(ids.length);
  // eslint-disable-next-line no-control-regex -- Assert the HTML-unsafe code-unit boundary.
  expect(ids.every(id => !/[\u0000-\u0020\u007f-\u009f\ud800]/.test(id))).toBe(true);
});
