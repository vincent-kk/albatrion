import { getValue } from '@winglet/json';
export default { pkg: '@winglet/json', fn: 'getValue', input: 'three pointer tokens', inputKind: 'plain', kind: 'micro', setup: () => {
  const data = { user: { profile: { name: 'Ada' } } };
  const tokens = ['user', 'profile', 'name'];
  return { run: () => getValue(data, tokens), check: (value) => value === 'Ada' };
} };
