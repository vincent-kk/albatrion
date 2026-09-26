// Token coverage guard for the design distillation.
// inventory: node tokens.mjs inventory <out.json> <files...>  — every normative token with its source lines
// check:     node tokens.mjs check <inventory.json> <targetFiles...> — tokens absent from all targets
import fs from 'node:fs';

const PATTERNS = [
  ['code', /`([^`\n]+)`/g],
  ['errorCode', /\b(SCHEMA_FORM_[A-Z_]+(?:\.[A-Z_]+)?)\b/g],
  ['id', /(?<![A-Za-z0-9_`-])((?:T|G|C|Q|S|E|R|N|O|D|B|L)-?\d+(?:G?-\d+)?[A-Z]?)(?![A-Za-z0-9_])/g],
  ['number', /(?<![\w.])(\d+(?:\.\d+)?\s?(?:ms|KB|MB|kB|%|회|개|번|배|줄|파일|케이스|초|행|칸|단계))/g],
];

const [mode, first, ...rest] = process.argv.slice(2);
if (mode === 'inventory') {
  const inv = {};
  for (const file of rest) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      for (const [kind, re] of PATTERNS) {
        for (const m of line.matchAll(re)) {
          const key = `${kind}\u0000${m[1]}`;
          (inv[key] ??= []).push(`${file}:${i + 1}`);
        }
      }
    });
  }
  fs.writeFileSync(first, JSON.stringify(inv));
  const byKind = {};
  for (const key of Object.keys(inv)) byKind[key.split('\u0000')[0]] = (byKind[key.split('\u0000')[0]] ?? 0) + 1;
  console.log(JSON.stringify({ distinctTokens: Object.keys(inv).length, byKind }));
} else if (mode === 'check') {
  const inv = JSON.parse(fs.readFileSync(first, 'utf8'));
  const target = rest.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const missing = Object.entries(inv).filter(([key]) => !target.includes(key.split('\u0000')[1]));
  console.log(JSON.stringify({ total: Object.keys(inv).length, missing: missing.length }));
  for (const [key, where] of missing) console.log(`${key.replace('\u0000', '\t')}\t${where.slice(0, 3).join(' ')}${where.length > 3 ? ` +${where.length - 3}` : ''}`);
} else {
  console.error('usage: inventory <out.json> <files...> | check <inventory.json> <targets...>');
  process.exit(2);
}
