import '../dom.mjs';
import { styleManagerFactory } from '@winglet/style-utils';

export default { pkg: '@winglet/style-utils', fn: 'inject', input: 'six 200-rule sheets, compressed and scoped', inputKind: 'repaired', kind: 'render', setup: () => {
  const frames = [];
  globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => frames.push(callback);
  const flushFrames = () => { for (const callback of frames.splice(0)) callback(performance.now()); };
  const repeat = (make) => Array.from({ length: 200 }, (_, i) => make(i)).join('\n');
  const large = repeat((i) => `
/* component ${i} */
.btn-${i} {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.87);
  background-color: #fafafa;
  transform: translate(-50%, -50%);
  transition: opacity 200ms ease-in-out, transform 150ms linear;
}
.btn-${i}:hover {
  background-color: #eeeeee;
}
.list-${i} > .item-${i} + .item-${i} {
  border-top: 1px solid #ddd;
}
.card-${i} .title-${i} ~ .body-${i} {
  font: 14px/1.5 sans-serif;
}`);
  const lists = repeat((i) => `.a${i}, .b${i} > .c, .d${i}:hover { color: red; margin: 0 }`);
  const isLists = repeat((i) => `.x${i}:is(.p, .q), a[title="t,${i}"], .y${i}:not(.r, .s) { color: red }`);
  const media = repeat((i) => `@media (min-width: ${i}px) { .m${i} { color: red } .n${i} > .o { margin: 0 } }`);
  const colonSpaces = repeat((i) => `.r${i} { color : red; margin : 0 auto; padding : 1px }`);
  const quoted = repeat((i) => `.q${i}::before { content: "q${i} \\201C"; font-family: "Helvetica Neue", 'Arial' }`);
  const css = [large, lists, isLists, media, colonSpaces, quoted].join('\n');
  const inject = styleManagerFactory('p2-mixed'); inject('sheet', css); flushFrames();
  return { run: () => inject('sheet', css), check: (cleanup) => { flushFrames(); return typeof cleanup === 'function' && document.head.textContent.includes('color'); }, after: (cleanup) => { cleanup(); } };
} };
