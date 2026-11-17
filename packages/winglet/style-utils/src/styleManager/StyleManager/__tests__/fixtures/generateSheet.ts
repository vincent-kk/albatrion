/** Selectors whose commas, braces and quotes hide inside parentheses, attributes and strings. */
const SELECTORS = [
  '.c1',
  '#id',
  'div > .c2',
  '.c3:hover',
  'li + li',
  'a[title="x,{};y"]',
  '.c4:is(.p, .q)',
  "[data-a='}']",
  '.c5::before',
];
/** Declarations whose values hold structural characters inside strings and functions. */
const DECLARATIONS = [
  'color: red',
  'margin: 0 auto',
  'content: "a{b}c;d,e:f"',
  "content: '/* not a comment */'",
  'background: url("x;y{z}.png")',
  'width: calc(1px + 2px)',
];
/** Comments holding structural characters. */
const COMMENTS = ['/* { */', '/* } */', '/* ; , : */', '/**/'];

/**
 * Builds a random stylesheet that a CSS parser accepts: style rules with selector
 * lists, nested `@media`/`@supports` groups up to two levels, and comments.
 *
 * @param random - Number source in [0, 1), such as `createRandom(seed)`
 * @param depth - Current group depth; call with `0`
 * @returns The stylesheet text
 */
export const generateSheet = (random: () => number, depth: number): string => {
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const space = () => pick(['', ' ', '\n  ']);
  let css = '';
  const count = 1 + Math.floor(random() * 4);
  for (let index = 0; index < count; index++) {
    const kind = random();
    if (kind < 0.15) css += pick(COMMENTS) + space();
    else if (kind < 0.3 && depth < 2)
      css +=
        pick(['@media (min-width: 1px)', '@supports (display: grid)']) +
        ' {' +
        space() +
        generateSheet(random, depth + 1) +
        '}' +
        space();
    else {
      const selectors = Array.from(
        { length: 1 + Math.floor(random() * 3) },
        () => pick(SELECTORS),
      );
      const declarations = Array.from(
        { length: 1 + Math.floor(random() * 3) },
        () => pick(DECLARATIONS) + (random() < 0.3 ? ' ' + pick(COMMENTS) : ''),
      );
      css +=
        selectors.join(',' + space()) +
        space() +
        '{' +
        space() +
        declarations.join(';' + space()) +
        space() +
        '}' +
        space();
    }
  }
  return css;
};
