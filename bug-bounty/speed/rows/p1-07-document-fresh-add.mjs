import '../dom.mjs';
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';
export default { pkg: '@winglet/style-utils', fn: 'styleManagerFactory/inject', input: 'fresh document scope', inputKind: 'plain', kind: 'render', setup: () => {
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  return { run: () => styleManagerFactory('p1-fresh')('sheet', '.a{color:red}', true), check: (cleanup) => typeof cleanup === 'function', after: async (cleanup) => { await new Promise((resolve) => setTimeout(resolve, 0)); cleanup(); destroyScope('p1-fresh'); } };
} };
