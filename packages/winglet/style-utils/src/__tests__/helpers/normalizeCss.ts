import { tokenize } from '@csstools/css-tokenizer';

/** Compare decoded non-whitespace tokens, allowing redundant declaration semicolons. */
export function normalizeCss(css: string): string[] {
  const tokens = tokenize({ css }).filter(token => token[0] !== 'EOF-token' && token[0] !== 'whitespace-token' && token[0] !== 'comment');
  return tokens.filter((token, index) => token[0] !== 'semicolon-token' || (tokens[index + 1]?.[0] !== '}-token' && tokens[index + 1]?.[0] !== 'semicolon-token'))
    .map(token => JSON.stringify([token[0], token[4]]));
}
