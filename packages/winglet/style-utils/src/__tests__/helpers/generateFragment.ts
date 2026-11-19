import { generateValidSheet } from './generateValidSheet';

/** Generate nested rule/statement placements and lexical EOF states within the declared depth limit. */
export const generateFragment = (random: () => number): string => {
  let css = generateValidSheet(random);
  for (let depth = 0, limit = Math.floor(random() * 3); depth < limit; depth++) {
    const rule = generateValidSheet(random);
    const statement = random() < 0.5 ? '@layer first,second;' : '@custom token;';
    const positions = [statement + css + rule, css + statement + rule, css + rule + statement];
    css = (random() < 0.5 ? '@media (min-width:1px){' : '@layer group{') + positions[Math.floor(random() * positions.length)] + '}';
  }
  switch (Math.floor(random() * 9)) {
    case 0: return css.slice(0, Math.floor(random() * css.length));
    case 1: return css + '/* unfinished';
    case 2: return css + '.tail{content:"unfinished' + (random() < 0.5 ? '\\' : '');
    case 3: return css + '@media (x){@layer unfinished';
    case 4: return css + '.unfinished:is(.a';
    case 5: return '};;' + css + ';}';
    case 6: return '<!--' + css + '-->';
    case 7: return '\uFEFF' + css;
    default: return css;
  }
};
