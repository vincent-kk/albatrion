/** Seeded stylesheet generator for hunter r5-style-react-modal. */
const pick = <T>(random: () => number, list: readonly T[]): T =>
  list[Math.floor(random() * list.length)];

const SELECTORS = [
  '.a',
  '.b .c',
  'a > b',
  '.x + .y',
  '.p:hover',
  ':root',
  ':host',
  '.q:is(.r, .s)',
  '[data-x="a,b"]',
  '.h\\31 x',
  '.md\\:flex',
  '.c\\{',
  '.u\\ ',
  "[title='it''s']",
  '.n:nth-child(2n + 1)',
  '.e::after',
  '.z /* c */ .w',
];
const VALUES = [
  'red',
  '"a;b}c"',
  "'x/*y'",
  'url(http://x.com/a/*b)',
  'url( "q.png" )',
  'url(a\\)b.png)',
  'calc(1px + 2px)',
  'calc(var(--a, ")") + 2px)',
  '1px/**/2px',
  '\\31 0px',
  'a\\;b',
  '0 0 0 1px rgba(0, 0, 0, .1)',
  '[one]',
  '{a:b}',
  'var(--x)',
  '1px - 2px',
  '"multi\\\nline"',
  '#fff',
  '-2px',
  '+.5',
  'u\\rl(x)',
];
const PROPS = ['color', 'margin', 'content', '--x', 'background', 'width'];

const declaration = (random: () => number) =>
  `${pick(random, PROPS)}${pick(random, [':', ': ', ' : '])}${pick(random, VALUES)}`;

const block = (random: () => number, depth: number): string => {
  const parts: string[] = [];
  const count = 1 + Math.floor(random() * 3);
  for (let i = 0; i < count; i++) {
    const r = random();
    if (depth < 2 && r < 0.15)
      parts.push(`${pick(random, SELECTORS)} {${block(random, depth + 1)}}`);
    else if (r < 0.2) parts.push('/* note } { ; */');
    else parts.push(declaration(random));
  }
  return parts.join(pick(random, [';', '; ', ';\n  '])) + pick(random, ['', ';', ' ']);
};

export const rule = (random: () => number, depth = 0): string => {
  const r = random();
  if (r < 0.08) return pick(random, ['@import url("a.css");', '@layer reset, base;', "@charset 'utf-8';", '@import url(x;y.css);', '@namespace svg url(http://www.w3.org/2000/svg);']);
  if (r < 0.14 && depth < 2)
    return `${pick(random, ['@media (min-width: 1px)', '@supports (display: grid)', '@layer base', '@container (width > 1px)'])} { ${rule(random, depth + 1)} ${rule(random, depth + 1)} }`;
  if (r < 0.18) return '@keyframes k { from { opacity: 0 } to { opacity: 1 } }';
  if (r < 0.22) return '@font-face { font-family: "F"; src: url(f.woff2) }';
  if (r < 0.25) return '/* between } rules */';
  const selectors = [pick(random, SELECTORS)];
  if (random() < 0.3) selectors.push(pick(random, SELECTORS));
  return `${selectors.join(pick(random, [',', ', ', ',\n']))} {${pick(random, [' ', '', '\n  '])}${block(random, depth)}${pick(random, [' ', '', '\n'])}}`;
};

export const sheet = (random: () => number): string => {
  const count = 1 + Math.floor(random() * 3);
  const rules: string[] = [];
  for (let i = 0; i < count; i++) rules.push(rule(random));
  return rules.join(pick(random, ['\n', '', ' ', '\r\n']));
};
