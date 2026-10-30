// usage: node tables.mjs <scenario> <topN> -> markdown table of self time with source file:line of the declaration
import fs from 'node:fs';

import context from './context.mjs';

const ROOT = context.packageDir + '/';
const [scenario, topArg = '25'] = process.argv.slice(2);
const s = JSON.parse(
  fs.readFileSync(
    new URL(`${scenario}/summary.json`, context.profiles),
    'utf8',
  ),
);
const locate = (name, src) => {
  if (!src.startsWith('src/'))
    return src.includes('hasOwnProperty')
      ? '@winglet/common-utils hasOwnProperty'
      : src;
  const file = src.replace(/:\+\d+$/, '');
  let text;
  try {
    text = fs.readFileSync(ROOT + file, 'utf8').split('\n');
  } catch {
    return file;
  }
  const base = name.replace(/^(get|set) /, '');
  const pats = [
    new RegExp(`(const|function\\*?|let) ${base}\\b`),
    new RegExp(`^\\s+(get |set |static |async )?${base}\\s*[(<]`),
    new RegExp(`\\b${base}\\b`),
  ];
  const off = Number(src.match(/:\+(\d+)$/)?.[1] ?? 0);
  for (const re of pats) {
    const hits = text.map((l, i) => (re.test(l) ? i + 1 : 0)).filter(Boolean);
    if (hits.length) {
      const best = hits.reduce((a, b) =>
        Math.abs(b - off) < Math.abs(a - off) ? b : a,
      );
      return `${file.replace('src/core/', '')}:${best}`;
    }
  }
  return file.replace('src/core/', '');
};
console.log(`${scenario}: profiled ${s.totalMs} ms, GC ${s.gcPct}%`);
console.log(
  '| # | function | source | self ms | self % | incl % |\n|---|---|---|---|---|---|',
);
s.self
  .slice(0, Number(topArg))
  .forEach((r, i) =>
    console.log(
      `| ${i + 1} | ${r.name} | ${locate(r.name, r.src)} | ${r.selfMs} | ${r.selfPct} | ${r.inclPct} |`,
    ),
  );
