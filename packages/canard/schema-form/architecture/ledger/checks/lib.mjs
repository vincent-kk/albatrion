// Shared parsing for the ledger checks: sentence splitting, ledger item parsing, source-location parsing.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

/** Commit whose line numbers the ledger cites. A document rewritten after it (HANDOFF.md) is read from this commit when the working tree no longer holds the cited text. */
export const BASE_COMMIT = process.env.LEDGER_BASE ?? 'ba398c330';

export const ID_RE = /^### ([A-Z]+-\d{3})(?:\s+(.*))?$/;
const FIELD_RE = /^- (결정|보충|상태|출처|닫은 사람|라운드|까닭|충돌):\s*(.*)$/;

/** Splits one document line into sentences. The same function serves the coverage check and the fragment provenance check. SENTENCE_MIN (default 8) drops shorter pieces; the final gate runs once with SENTENCE_MIN=3. */
export function splitSentences(line) {
  const body = line.trim();
  if (!body) return [];
  if (body.startsWith('|')) return [body];
  return body
    .split(/(?<=[다임음됨것함임]\.|\)\.|\.\)|\.\*\*|\?|!)\s+/)
    .map((s) => s.replace(/^[-*]\s+|^\d+\.\s+|^>\s*/, '').trim())
    .filter((s) => s.length > Number(process.env.SENTENCE_MIN ?? 8));
}

/** Parses one ledger file into items. Blockquote lines under 결정/보충/충돌 are returned stripped of the `> ` prefix. */
export function parseLedger(text) {
  const items = [];
  let cur = null;
  let field = null;
  let inFence = false;
  for (const line of text.split('\n')) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const head = line.match(ID_RE);
    if (head) { cur = { id: head[1], title: head[2] ?? '', 결정: [], 보충: [], 충돌: [], 상태: '', 출처: '', '닫은 사람': '', 라운드: '', 까닭: '' }; items.push(cur); field = null; continue; }
    if (!cur) continue;
    if (/^## /.test(line)) { cur = null; field = null; continue; }
    const f = line.match(FIELD_RE);
    if (f) { field = f[1]; if (!Array.isArray(cur[field])) cur[field] = f[2].trim(); else if (f[2].trim()) cur[field].push(f[2].trim()); continue; }
    if (field && Array.isArray(cur[field]) && /^\s*>/.test(line)) {
      const body = line.replace(/^\s*>\s?/, '');
      if (body.trim()) cur[field].push(body);
    }
  }
  return items;
}

/** Parses `path:12`, `path:12-15`, `path:12,15,20`, `path:12#2`, `path:12#2-4` inside backticks into {file, lines[], fragment?, fragmentEnd?}. */
export function parseLocations(text) {
  const out = [];
  for (const m of text.matchAll(/`([^`\s:]+\.md):([\d,\-]+)(?:#(\d+)(?:-(\d+))?)?`/g)) {
    const lines = [];
    for (const part of m[2].split(',')) {
      const [a, b] = part.split('-').map(Number);
      for (let n = a; n <= (b ?? a); n++) lines.push(n);
    }
    out.push({ file: m[1], lines, fragment: m[3] ? Number(m[3]) : null, fragmentEnd: m[4] ? Number(m[4]) : null, raw: m[0] });
  }
  return out;
}

export function docReader(root) {
  const cache = new Map();
  return (rel) => {
    if (!cache.has(rel)) { const p = path.join(root, rel); cache.set(rel, fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n') : null); }
    return cache.get(rel);
  };
}

/** Reads a document as it was at BASE_COMMIT (null when it did not exist there). */
export function baseReader(root) {
  const cache = new Map();
  return (rel) => {
    if (!cache.has(rel)) {
      try { cache.set(rel, execFileSync('git', ['show', `${BASE_COMMIT}:./${rel}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n')); }
      catch { cache.set(rel, null); }
    }
    return cache.get(rel);
  };
}

export function readLedgers(paths) {
  return paths.flatMap((p) => parseLedger(fs.readFileSync(p, 'utf8')).map((it) => ({ ...it, file: p })));
}
