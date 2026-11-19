/** Valid selector preludes exercise descendant, list, attribute and An+B boundaries. */
const SELECTORS = ['.a', '.a [data-x]', '[data-x] .b', ':is(.a) .b', '.a>.b', '.a~.b', '.a+.b', 'col||td', ':is(.a>.b,.c)', ':not(.a+.b)', ':nth-child(2n + 1)', '[a="b" i]', '.a\\31  .b', '.md\\:flex'];
/** Custom properties admit these complete component-value streams without a property grammar. */
const VALUES = ['1px + 2px', '1px - 2px', 'a > b', 'a ~ b', 'calc(1px + 2px)', 'a / b', 'var(--a,2px)', ' ', 'U+00A0-00FF', '1px/**/2px', 'a/**/-b', '<!/**/--', '|/**/=', '"a ( b ) /* literal */"', 'url(http://x/a/*b)', '{a:b}', '[one]', 'u\\rl(x)', '"multi\\\nline"'];

/** Generate valid sheets with essential whitespace already isolated from formatting trivia. */
export const generateValidSheet = (random: () => number): string => {
  const selector = SELECTORS[Math.floor(random() * SELECTORS.length)];
  const value = VALUES[Math.floor(random() * VALUES.length)];
  const rule = selector + '{--value:' + value + ';color:red}';
  switch (Math.floor(random() * 8)) {
    case 0: return '@media (min-width:calc(10px + 2px)){' + rule + '}';
    case 1: return '@supports (display:grid){' + rule + '}';
    case 2: return '@layer theme{@layer light,dark;' + rule + '}';
    case 3: return '@import url("a.css");' + rule;
    case 4: return '@keyframes k{from{opacity:0}to{opacity:1}}' + rule;
    case 5: return '@font-face{font-family:"F";src:url(f.woff2)}' + rule;
    default: return rule;
  }
};
