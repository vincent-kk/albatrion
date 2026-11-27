import { compressCss } from '@winglet/style-utils';
export default { pkg: '@winglet/style-utils', fn: 'compressCss', input: 'flat combinator rule', inputKind: 'plain', kind: 'micro', setup: () => {
  const css = '.list>.item+.item{border-top:1px solid #ddd}';
  return { run: () => compressCss(css), check: (value) => typeof value === 'string' && value.includes('border-top') };
} };
