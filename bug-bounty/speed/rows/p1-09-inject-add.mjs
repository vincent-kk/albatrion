import '../dom.mjs';
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';
export default { pkg: '@winglet/style-utils', fn: 'inject', input: 'active document scope', inputKind: 'plain', kind: 'render', setup: async () => {
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  const inject = styleManagerFactory('p1-inject'); inject('seed', '.seed{color:blue}', true); await new Promise((resolve) => setTimeout(resolve, 0));
  return { run: () => inject('sheet', '.a{color:red}', true), check: (cleanup) => typeof cleanup === 'function', after: async (cleanup) => { await new Promise((resolve) => setTimeout(resolve, 0)); cleanup(); } };
} };
