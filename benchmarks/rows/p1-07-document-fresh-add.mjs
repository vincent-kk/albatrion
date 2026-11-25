import '../dom.mjs';
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';
export default { pkg: '@winglet/style-utils', fn: 'styleManagerFactory/inject', input: 'fresh document scope', inputKind: 'plain', kind: 'render', setup: () => {
  const frames = [];
  const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback);
  return { run: () => styleManagerFactory('p1-fresh')('sheet', '.a{color:red}', true), check: (cleanup) => typeof cleanup === 'function', after: (cleanup) => { flushFrames(); cleanup(); destroyScope('p1-fresh'); } };
} };
