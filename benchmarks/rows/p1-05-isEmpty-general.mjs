import { isEmpty } from '@winglet/common-utils';
export default { pkg: '@winglet/common-utils', fn: 'isEmpty', input: '12 mixed values in order', inputKind: 'plain', kind: 'micro', setup: () => {
  const values = [undefined, null, false, true, 0, 1, '', 'x', [], [1], {}, { x: 1 }];
  return { run: () => { let count = 0; for (const value of values) if (isEmpty(value)) count++; return count; }, check: (count) => count === 7 };
} };
