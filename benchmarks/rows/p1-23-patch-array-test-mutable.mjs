import { applyPatch } from '@winglet/json';
export default { pkg: '@winglet/json', fn: 'applyPatch', input: 'mutable array test patch', inputKind: 'plain', kind: 'micro', setup: () => {
  const source = [10, 20, 30]; const patches = [{ op: 'test', path: '/1', value: 20 }]; const options = { immutable: false, strict: true };
  return { run: () => applyPatch(source, patches, options), check: (value) => value === source && value[1] === 20 };
} };
