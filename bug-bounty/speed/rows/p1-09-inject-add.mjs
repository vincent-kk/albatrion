import '../dom.mjs';
import { destroyScope, styleManagerFactory } from '@winglet/style-utils';
export default { pkg: '@winglet/style-utils', fn: 'inject', input: 'active document scope', inputKind: 'plain', kind: 'render', setup: () => {
  const frames = [];
  const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback);
  const inject = styleManagerFactory('p1-inject'); inject('seed', '.seed{color:blue}', true); flushFrames();
  return { run: () => inject('sheet', '.a{color:red}', true), check: (cleanup) => typeof cleanup === 'function', after: (cleanup) => { flushFrames(); cleanup(); } };
} };
