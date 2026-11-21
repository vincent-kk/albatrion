import { isCommentNode, isSimpleBlockNode, isTokenNode, isWhitespaceNode, parseListOfComponentValues, type ComponentValue } from '@csstools/css-parser-algorithms';
import { tokenize } from '@csstools/css-tokenizer';
import { serializeComponents } from './serializeComponents';

/** Execute CSS Syntax Level 3 consume-a-stylesheet over independently parsed component values. */
export const readStylesheet = (css: string): string[] => {
  const values = parseListOfComponentValues(tokenize({ css }));
  const rules: string[] = [];
  let index = 0;
  while (index < values.length) {
    const first = values[index];
    if (isWhitespaceNode(first) || isCommentNode(first) || (isTokenNode(first) && (first.value[0] === 'CDO-token' || first.value[0] === 'CDC-token'))) { index++; continue; }
    const atRule = isTokenNode(first) && first.value[0] === 'at-keyword-token';
    const prelude: ComponentValue[] = [];
    let block: string | undefined;
    while (index < values.length) {
      const value = values[index++];
      if (atRule && isTokenNode(value) && value.value[0] === 'semicolon-token') { block = ';'; break; }
      if (isSimpleBlockNode(value) && value.startToken[0] === '{-token') { block = '{' + serializeComponents(value.value) + '}'; break; }
      prelude.push(value);
    }
    if (block === undefined && !atRule) break;
    rules.push(serializeComponents(prelude, !atRule) + ' => ' + (block ?? ';'));
  }
  return rules;
};
