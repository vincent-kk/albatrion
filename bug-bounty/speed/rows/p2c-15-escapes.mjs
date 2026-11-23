import '../dom.mjs';
import { styleManagerFactory } from '@winglet/style-utils';

export default { pkg: '@winglet/style-utils', fn: 'inject', input: '200 compressed rules with escaped space and quote', inputKind: 'repaired', kind: 'render', setup: () => {
  console.error = () => {};
  const frames = [];
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback);
  const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const css = Array.from({ length: 200 }, (_, i) => `.e${i}\\ ,.q${i}\\'x{color:red}`).join('');
  const inject = styleManagerFactory('p2-escapes'); inject('sheet', css, true); flushFrames();
  return { run: () => inject('sheet', css, true), check: (cleanup) => { flushFrames(); return typeof cleanup === 'function' && document.head.textContent.includes('color'); }, after: (cleanup) => { cleanup(); } };
} };
