import { getValue } from '@winglet/json';

export default { pkg: '@winglet/json', fn: 'getValue', input: 'URI fragment with a percent-encoded key', inputKind: 'repaired', kind: 'micro', setup: () => {
  const value = { 'a b': 7, 'a%20b': 7 };
  return { run: () => getValue(value, '#/a%20b'), check: (result) => result === 7 };
} };
