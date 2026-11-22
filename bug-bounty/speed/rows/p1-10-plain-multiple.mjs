import { compressCss } from '@winglet/style-utils';
export default { pkg: '@winglet/style-utils', fn: 'compressCss', input: '200 flat rules', inputKind: 'plain', kind: 'micro', setup: () => {
  const css = Array.from({ length: 200 }, (_, i) => `.r${i}{color:red;margin:0}`).join('');
  return { run: () => compressCss(css), check: (value) => typeof value === 'string' && value.includes('.r199') };
} };
