import { getValue } from '@winglet/json';
export default { pkg: '@winglet/json', fn: 'getValue', input: 'unencoded fragment pointer', inputKind: 'plain', kind: 'micro', setup: () => {
  const data = { user: { profile: { name: 'Ada' } } };
  return { run: () => getValue(data, '#/user/profile/name'), check: (value) => value === 'Ada' };
} };
