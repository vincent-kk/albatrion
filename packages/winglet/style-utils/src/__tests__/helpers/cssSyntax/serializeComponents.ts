import { type ComponentValue, isCommentNode, isFunctionNode, isSimpleBlockNode, isTokenNode, isWhitespaceNode } from '@csstools/css-parser-algorithms';
import { tokenKey } from './tokenKey';

/** Serialize the Syntax tree, normalizing only redundant semicolons and selector-list combinator trivia. */
export const serializeComponents = (values: ComponentValue[], selector = false): string => {
  const parts: string[] = [];
  const meaningful = values.filter(value => !isCommentNode(value));
  for (let index = 0; index < meaningful.length; index++) {
    const value = meaningful[index];
    if (isWhitespaceNode(value)) {
      const previous = meaningful[index - 1], next = meaningful[index + 1];
      const combinator = (node: ComponentValue | undefined) => node && isTokenNode(node) && (node.value[0] === 'comma-token' || (node.value[0] === 'delim-token' && ['>', '~', '+'].includes(node.value[4].value)));
      if (selector && (combinator(previous) || combinator(next))) continue;
      if (parts.length && parts[parts.length - 1] !== ' ') parts.push(' ');
      continue;
    }
    if (isFunctionNode(value)) parts.push(`fn:${value.getName()}(${serializeComponents(value.value, selector && ['is', 'not', 'where', 'has'].includes(value.getName()))})`);
    else if (isSimpleBlockNode(value)) parts.push(`${value.startToken[1]}${serializeComponents(value.value)}END`);
    else if (isTokenNode(value)) {
      if (value.value[0] === 'semicolon-token' && !meaningful.slice(index + 1).some(item => !isWhitespaceNode(item) && !(isTokenNode(item) && item.value[0] === 'semicolon-token'))) continue;
      parts.push(tokenKey(value.value));
    }
  }
  while (parts[0] === ' ') parts.shift();
  while (parts[parts.length - 1] === ' ') parts.pop();
  return parts.join('|');
};
