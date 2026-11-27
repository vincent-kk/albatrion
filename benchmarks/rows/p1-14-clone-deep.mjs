import { clone } from '@winglet/common-utils';
export default { pkg: '@winglet/common-utils', fn: 'clone', input: '300-deep next chain', inputKind: 'plain', kind: 'micro', setup: () => {
  let input = 1; for (let i = 0; i < 300; i++) input = { next: input };
  return { run: () => clone(input), check: (value) => { if (value === input) return false; for (let i = 0; i < 300; i++) value = value.next; return value === 1; } };
} };
