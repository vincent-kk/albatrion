// Loaded by `vitest bench` (`yarn workspace @winglet/style-utils test bench --run`).
// Speed gates compare CPU time across builds in separate `node --single-threaded`
// processes; these rows fix the inputs that every such comparison must cover.
import { bench, describe } from 'vitest';

import { compressCss, styleManagerFactory } from '@/style-utils';

/** Builds a sheet of 200 rules from one rule template. */
const repeat = (make: (index: number) => string): string =>
  Array.from({ length: 200 }, (_, index) => make(index)).join('\n');

/** promise-modal's background sheet: a real small sheet with no quotes or lists. */
const small = `
.background-abc {
  display: none;
  position: fixed;
  inset: 0;
  z-index: -999;
  pointer-events: none;
}

.background-abc > * {
  pointer-events: none;
}

.background-abc.active-abc {
  pointer-events: all;
}
`;

/** Flat rules with comments, functions and every combinator. */
const large = repeat(
  (index) => `
/* component ${index} */
.btn-${index} {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  margin: 0 auto;
  color: rgba(0, 0, 0, 0.87);
  background-color: #fafafa;
  transform: translate(-50%, -50%);
  transition: opacity 200ms ease-in-out, transform 150ms linear;
}
.btn-${index}:hover {
  background-color: #eeeeee;
}
.list-${index} > .item-${index} + .item-${index} {
  border-top: 1px solid #ddd;
}
.card-${index} .title-${index} ~ .body-${index} {
  font: 14px/1.5 sans-serif;
}`,
);

/** Plain selector lists: each selector is prefixed. */
const lists = repeat(
  (index) =>
    `.a${index}, .b${index} > .c, .d${index}:hover { color: red; margin: 0 }`,
);

/** Lists whose commas hide inside `:is()`, `:not()` and a quoted attribute value. */
const isLists = repeat(
  (index) =>
    `.x${index}:is(.p, .q), a[title="t,${index}"], .y${index}:not(.r, .s) { color: red }`,
);

/** `@media` blocks whose inner rules are scoped. */
const media = repeat(
  (index) =>
    `@media (min-width: ${index}px) { .m${index} { color: red } .n${index} > .o { margin: 0 } }`,
);

/** Declarations with a space before the colon, which the compressor must look past. */
const colonSpaces = repeat(
  (index) => `.r${index} { color : red; margin : 0 auto; padding : 1px }`,
);

/** Quoted strings with escapes, copied verbatim by the compressor. */
const quoted = repeat(
  (index) =>
    `.q${index}::before { content: "q${index} \\201C"; font-family: "Helvetica Neue", 'Arial' }`,
);

/** Every sheet above in one input, so no single fast path can carry the row. */
const mixed = [large, lists, isLists, media, colonSpaces, quoted].join('\n');

/** Scopes already compressed CSS, so the row measures scoping alone. */
const scopeOnly = (css: string, scope: string): (() => void) => {
  const addStyle = styleManagerFactory(`bench-scope-${scope}`);
  const compressed = compressCss(css);
  return () => void addStyle('sheet', compressed, true);
};

/** Scopes and compresses, as `addStyle(id, css)` does by default. */
const scopeAndCompress = (css: string, scope: string): (() => void) => {
  const addStyle = styleManagerFactory(`bench-full-${scope}`);
  return () => void addStyle('sheet', css);
};

describe('compressCss', () => {
  bench('small', () => void compressCss(small));
  bench('large', () => void compressCss(large));
  bench('colonSpaces', () => void compressCss(colonSpaces));
  bench('quoted', () => void compressCss(quoted));
});

describe('scope', () => {
  bench('small', scopeOnly(small, 'small'));
  bench('large', scopeOnly(large, 'large'));
  bench('lists', scopeOnly(lists, 'lists'));
  bench('isLists', scopeOnly(isLists, 'isLists'));
  bench('media', scopeOnly(media, 'media'));
});

describe('add', () => {
  bench('large', scopeAndCompress(large, 'large'));
  bench('mixed', scopeAndCompress(mixed, 'mixed'));
});
