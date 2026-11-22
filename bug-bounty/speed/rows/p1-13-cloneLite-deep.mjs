import { cloneLite } from '@winglet/common-utils';
export default { pkg: '@winglet/common-utils', fn: 'cloneLite', input: '300-deep child chain', inputKind: 'plain', kind: 'micro', setup: () => {
  let input = 1; for (let i = 0; i < 300; i++) input = { child: input };
  return { run: () => cloneLite(input), check: (value) => { if (value === input) return false; for (let i = 0; i < 300; i++) value = value.child; return value === 1; } };
} };
