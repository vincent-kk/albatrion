/** Copied unchanged from bug-bounty/round-4/probes/winglet-style-utils/r4-json-style/oracle.ts (reference scoper). */
import { type CSSToken, tokenize } from '@csstools/css-tokenizer';

export const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const toks = (css: string): CSSToken[] =>
  tokenize({ css }).filter((t) => t[0] !== 'EOF-token');

const sem = (t: CSSToken): string => {
  const data = (t as any)[4];
  if (t[0] === 'dimension-token') return `dim:${data.value}${data.unit}`;
  if (t[0] === 'number-token' || t[0] === 'percentage-token')
    return `${t[0]}:${data.value}`;
  if (data && 'value' in data) return `${t[0]}:${data.value}`;
  return t[0];
};

/** All tokens except whitespace and comments, by decoded value. */
export const n1 = (css: string): string[] => {
  const list = toks(css)
    .filter((t) => t[0] !== 'whitespace-token' && t[0] !== 'comment')
    .map(sem);
  // A semicolon before `}` and a repeated semicolon carry no meaning.
  return list.filter(
    (s, k) =>
      s !== 'semicolon-token' ||
      (list[k + 1] !== '}-token' && list[k + 1] !== 'semicolon-token'),
  );
};

const LOOSE = new Set([',', '>', '+', '~', '(', ')', '{', '}', ';']);
const looseSym = (s: string) => {
  const m = /^(?:delim-token:)?(.)$/.exec(s);
  if (s === 'comma-token') return ',';
  if (s === '(-token') return '(';
  if (s === ')-token') return ')';
  if (s.startsWith('function-token')) return '(';
  return m ? m[1] : '';
};

/** Selector preludes before each `{`, whitespace collapsed and dropped next to combinators. */
export const n2 = (css: string): string[] => {
  const all = toks(css).filter((t) => t[0] !== 'comment');
  const out: string[] = [];
  let start = 0;
  all.forEach((t, i) => {
    if (t[0] === '{-token') {
      const pre = all.slice(start, i).map((x) =>
        x[0] === 'whitespace-token' ? 'WS' : sem(x),
      );
      const norm: string[] = [];
      for (const s of pre) {
        if (s === 'WS') {
          if (norm.length && norm[norm.length - 1] !== 'WS') norm.push('WS');
        } else norm.push(s);
      }
      const res = norm.filter((s, k) => {
        if (s !== 'WS') return true;
        if (k === 0 || k === norm.length - 1) return false;
        if (norm[k - 1] === 'colon-token') return false;
        return !LOOSE.has(looseSym(norm[k - 1])) && !LOOSE.has(looseSym(norm[k + 1]));
      });
      out.push(res.join(' '));
    }
    if (t[0] === '{-token' || t[0] === '}-token' || t[0] === 'semicolon-token')
      start = i + 1;
  });
  return out;
};

const GROUPING =
  /^(?:-[a-z]+-)?(?:media|supports|container|layer|scope|document|starting-style)$/i;

/**
 * Token-level reference scoper following CSS Syntax 3 rule parsing for well-formed sheets.
 */
export const refScope = (css: string, scope: string): string => {
  const ts = toks(css);
  let i = 0;
  const raw = (a: number, b: number) =>
    ts
      .slice(a, b)
      .map((t) => t[1])
      .join('');
  const skipBlock = (): number => {
    // i at an opening token; returns index after the matching close
    let depth = 0;
    for (; i < ts.length; i++) {
      const ty = ts[i][0];
      if (ty === '{-token' || ty === '(-token' || ty === '[-token' || ty === 'function-token')
        depth++;
      else if (ty === '}-token' || ty === ')-token' || ty === ']-token') {
        depth--;
        if (depth === 0) {
          i++;
          return i;
        }
      }
    }
    throw new Error('unterminated');
  };
  const prefixList = (a: number, b: number): string => {
    const members: [number, number][] = [];
    let depth = 0;
    let s = a;
    for (let k = a; k < b; k++) {
      const ty = ts[k][0];
      if (ty === '(-token' || ty === '[-token' || ty === 'function-token' || ty === '{-token') depth++;
      else if (ty === ')-token' || ty === ']-token' || ty === '}-token') depth--;
      else if (ty === 'comma-token' && depth === 0) {
        members.push([s, k]);
        s = k + 1;
      }
    }
    members.push([s, b]);
    return members
      .map(([x, y]) => {
        while (x < y && (ts[x][0] === 'whitespace-token' || ts[x][0] === 'comment')) x++;
        while (y > x && (ts[y - 1][0] === 'whitespace-token' || ts[y - 1][0] === 'comment')) y--;
        if (x === y) return '';
        const meaningful = ts.slice(x, y).filter((t) => t[0] !== 'comment');
        if (
          meaningful.length === 2 &&
          meaningful[0][0] === 'colon-token' &&
          meaningful[1][0] === 'ident-token' &&
          /^(root|host)$/i.test((meaningful[1] as any)[4].value)
        )
          return raw(x, y);
        return scope + ' ' + raw(x, y);
      })
      .join(',');
  };
  const ruleList = (nested: boolean): string => {
    let out = '';
    for (;;) {
      if (i >= ts.length) {
        if (nested) throw new Error('unterminated');
        return out;
      }
      const t = ts[i];
      if (t[0] === 'whitespace-token' || t[0] === 'comment') {
        i++;
        continue;
      }
      if (t[0] === '}-token') {
        if (nested) {
          i++;
          return out;
        }
        throw new Error('stray }');
      }
      if (t[0] === 'at-keyword-token') {
        const start = i;
        const name = (t as any)[4].value as string;
        i++;
        for (;;) {
          if (i >= ts.length) {
            out += raw(start, i).trim();
            return out;
          }
          const ty = ts[i][0];
          if (ty === 'semicolon-token') {
            i++;
            out += raw(start, i);
            break;
          }
          if (ty === '{-token') {
            const pre = raw(start, i).trim();
            if (GROUPING.test(name)) {
              i++;
              const inner = ruleList(true);
              out += pre + '{' + inner + '}';
            } else {
              const b = i;
              skipBlock();
              out += pre + raw(b, i);
            }
            break;
          }
          if (ty === '(-token' || ty === '[-token' || ty === 'function-token') skipBlock();
          else i++;
        }
        continue;
      }
      // qualified rule
      const start = i;
      for (;;) {
        if (i >= ts.length) throw new Error('unterminated rule');
        const ty = ts[i][0];
        if (ty === '{-token') break;
        if (ty === '(-token' || ty === '[-token' || ty === 'function-token') skipBlock();
        else i++;
      }
      const open = i;
      skipBlock();
      out += prefixList(start, open) + raw(open, i);
    }
  };
  return ruleList(false);
};
