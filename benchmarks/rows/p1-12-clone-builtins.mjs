import { clone } from '@winglet/common-utils';
export default { pkg: '@winglet/common-utils', fn: 'clone', input: 'array and built-in values', inputKind: 'plain', kind: 'micro', setup: () => {
  const input = [[1, 2], new Date(0), /ab/gi, new Map([['x', 1], ['y', 2]]), new Set([1, 2])];
  return { run: () => clone(input), check: (value) => value !== input && value[0][1] === 2 && value[1].getTime() === 0 && value[2].source === 'ab' && value[3].get('y') === 2 && value[4].has(2) };
} };
