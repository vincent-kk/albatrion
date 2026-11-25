import { getValue } from '@winglet/json';
export default { pkg: '@winglet/json', fn: 'getValue', input: 'array pointer', inputKind: 'plain', kind: 'micro', setup: () => {
  const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
  return { run: () => getValue(data, '/1/value'), check: (value) => value === 20 };
} };
