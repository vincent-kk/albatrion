/**
 * Probe helpers for hunter r5-style-react-modal.
 *
 * `topLevelRules` follows CSS Syntax Level 3 "consume a stylesheet's contents"
 * (https://www.w3.org/TR/css-syntax-3/#consume-stylesheet-contents) on top of the
 * spec tokenizer `@csstools/css-tokenizer` and the component value parser
 * `@csstools/css-parser-algorithms`, both installed at the repository root.
 */
import {
  type ComponentValue,
  isCommentNode,
  isFunctionNode,
  isSimpleBlockNode,
  isTokenNode,
  isWhitespaceNode,
  parseListOfComponentValues,
} from '@csstools/css-parser-algorithms';
import { type CSSToken, tokenize } from '@csstools/css-tokenizer';

export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const tokens = (css: string): CSSToken[] =>
  tokenize({ css }).filter((t) => t[0] !== 'EOF-token');

const tokenKey = (t: CSSToken): string => {
  const data = (t as any)[4];
  if (t[0] === 'dimension-token') return `dim:${data.value}${data.unit}`;
  if (t[0] === 'number-token' || t[0] === 'percentage-token')
    return `${t[0]}:${data.value}`;
  if (data && 'value' in data) return `${t[0]}:${data.value}`;
  return t[0];
};

/** Significant tokens (no whitespace, no comments), decoded. */
export const significantTokens = (css: string): string[] => {
  const list = tokens(css)
    .filter((t) => t[0] !== 'whitespace-token' && t[0] !== 'comment')
    .map(tokenKey);
  return list.filter(
    (s, k) =>
      s !== 'semicolon-token' ||
      (list[k + 1] !== '}-token' && list[k + 1] !== 'semicolon-token'),
  );
};

/** Serialize component values: whitespace collapsed to one marker, comments dropped. */
const serialize = (values: ComponentValue[]): string => {
  const parts: string[] = [];
  for (const value of values) {
    if (isCommentNode(value)) continue;
    if (isWhitespaceNode(value)) {
      if (parts.length && parts[parts.length - 1] !== ' ') parts.push(' ');
      continue;
    }
    if (isFunctionNode(value))
      parts.push(`fn:${value.getName()}(${serialize(value.value)})`);
    else if (isSimpleBlockNode(value))
      parts.push(`${value.startToken[1]}${serialize(value.value)}END`);
    else if (isTokenNode(value)) parts.push(tokenKey(value.value));
  }
  while (parts[0] === ' ') parts.shift();
  while (parts[parts.length - 1] === ' ') parts.pop();
  return parts.join('|');
};

/**
 * Top-level rules of a stylesheet as the browser's CSS Syntax parser builds them.
 * Each rule is `prelude => block` (or `prelude ;` for a statement at-rule).
 */
/** Sheets whose last top-level qualified rule reached EOF without a block. */
export const droppedAtEof = new Set<string>();

export const topLevelRules = (css: string): string[] => {
  const values = parseListOfComponentValues(tokenize({ css }));
  const rules: string[] = [];
  let index = 0;
  while (index < values.length) {
    const value = values[index];
    if (isWhitespaceNode(value) || isCommentNode(value)) {
      index++;
      continue;
    }
    if (
      isTokenNode(value) &&
      (value.value[0] === 'CDO-token' || value.value[0] === 'CDC-token')
    ) {
      index++;
      continue;
    }
    const isAt = isTokenNode(value) && value.value[0] === 'at-keyword-token';
    const prelude: ComponentValue[] = [];
    let block: string | null = null;
    let ended = false;
    while (index < values.length) {
      const current = values[index++];
      if (
        isAt &&
        isTokenNode(current) &&
        current.value[0] === 'semicolon-token'
      ) {
        block = ';';
        ended = true;
        break;
      }
      if (isSimpleBlockNode(current) && current.startToken[0] === '{-token') {
        block = '{' + serialize(current.value) + '}';
        ended = true;
        break;
      }
      prelude.push(current);
    }
    // A qualified rule that reaches EOF is dropped; an at-rule is returned
    // as if a semicolon ended it.
    if (!ended && !isAt) {
      droppedAtEof.add(css);
      break;
    }
    rules.push(`${serialize(prelude)} => ${block ?? ';'}`);
  }
  return rules;
};

/** Run the StyleManager flush synchronously by stubbing requestAnimationFrame. */
export const captureFrames = () => {
  const callbacks: FrameRequestCallback[] = [];
  return {
    request: (callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    },
    flush: () => {
      const queued = callbacks.splice(0);
      for (const callback of queued) callback(0);
    },
  };
};
