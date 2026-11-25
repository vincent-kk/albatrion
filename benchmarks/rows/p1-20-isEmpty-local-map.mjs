import { isEmpty } from '@winglet/common-utils';
export default { pkg: '@winglet/common-utils', fn: 'isEmpty', input: 'nonempty local map', inputKind: 'plain', kind: 'micro', setup: () => {
  const input = new Map([['a', 1]]);
  return { run: () => isEmpty(input), check: (value) => value === false };
} };
