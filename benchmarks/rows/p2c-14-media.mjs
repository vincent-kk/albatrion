import '../dom.mjs';
import { styleManagerFactory } from '@winglet/style-utils';

export default { pkg: '@winglet/style-utils', fn: 'inject', input: '200 compressed media groups', inputKind: 'repaired', kind: 'render', setup: () => {
  const frames = [];
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback);
  const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const css = Array.from({ length: 200 }, (_, i) => `@media (min-width:${i}px){.m${i}{color:red}.n${i}>.o{margin:0}}`).join('');
  const inject = styleManagerFactory('p2-media'); inject('sheet', css, true); flushFrames();
  return { run: () => inject('sheet', css, true), check: (cleanup) => { flushFrames(); return typeof cleanup === 'function' && document.head.textContent.includes('color'); }, after: (cleanup) => { cleanup(); } };
} };
