import { tokenize } from '@csstools/css-tokenizer';
import { tokenKey } from './tokenKey';

/** Compare non-trivia token boundaries; the Syntax-tree oracle separately checks meaningful whitespace. */
export const readSignificantTokens = (css: string): string[] => {
  const tokens = tokenize({ css }).filter(token => token[0] !== 'EOF-token' && token[0] !== 'comment' && token[0] !== 'whitespace-token').map(tokenKey);
  return tokens.filter((token, index) => token !== 'semicolon-token' || (tokens[index + 1] !== '}-token' && tokens[index + 1] !== 'semicolon-token'));
};
