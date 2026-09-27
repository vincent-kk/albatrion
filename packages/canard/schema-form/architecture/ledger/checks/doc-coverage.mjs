// Check ledger coverage in design docs; usage: node ledger/checks/doc-coverage.mjs [--areas A,B,…] [--exempt <tsv>] <doc.md…> -- <ledger.md…>.
import fs from 'node:fs';
import { readLedgers, splitSentences, TOKEN_PATTERNS } from './lib.mjs';

const usage = 'usage: node ledger/checks/doc-coverage.mjs [--areas A,B,…] [--exempt <tsv>] <doc.md…> -- <ledger.md…>';
const idPattern = /\b([A-Z]{4,9}-\d{3})\b/g;
const inlineCodePattern = /`[^`\n]*`/g;
const quotedSpanPattern = /"[^"\n]*"|“[^”\n]*”/g;
const fencePattern = /^\s*```/;
const sectionHeadingPattern = /^#{2,3} /;
const markdownHeadingPattern = /^#{1,6} /;
const tableSeparatorPattern = /^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/;
const oldReferencePattern = /^(0\d-[^`]*\.md|open-questions\.md|adr\/\d{4}-[^`]*|reviews\/[^`]*|HANDOFF\.md|README\.md)(:[\d,#-]+)?$/;
const locationOnlyPattern = /^:\d[\d,#-]*$/;
const reasonPattern = /^(이긴 충돌|가리킴 바꿈|정비 문장)(\s|$)/;
const containsId = (text) => !text.matchAll(idPattern).next().done;
const maskLine = (text) => text.replace(inlineCodePattern, ' ').replace(quotedSpanPattern, ' ');
const args = process.argv.slice(2);
const separator = args.indexOf('--');
const docPaths = [];
let areas = null;
let exemptPath = 'ledger/checks/doc-token-exempt.tsv';

if (separator < 0 || separator === args.length - 1) {
  console.error(usage);
  process.exit(2);
}
for (let i = 0; i < separator; i++) {
  if (args[i] === '--areas' && i + 1 < separator && args[i + 1]) {
    areas = new Set(args[++i].split(','));
  } else if (args[i] === '--exempt' && i + 1 < separator && args[i + 1]) {
    exemptPath = args[++i];
  } else if (args[i].startsWith('--')) {
    console.error(usage);
    process.exit(2);
  } else {
    docPaths.push(args[i]);
  }
}
if (!docPaths.length) {
  console.error(usage);
  process.exit(2);
}

const items = readLedgers(args.slice(separator + 1));
const byId = new Map(items.map((item) => [item.id, item]));
if (areas && [...areas].some((area) => !items.some((item) => item.id.startsWith(`${area}-`)))) {
  console.error(usage);
  process.exit(2);
}
const inForce = (item) => item.상태.startsWith('현행');
const inScope = (item) => inForce(item) && (!areas || areas.has(item.id.split('-')[0]));
const scopedItems = items.filter(inScope);
const sectionsById = new Map();
let missingDocs = 0;
let badIds = 0;
let untaggedSentences = 0;

for (const docPath of docPaths) {
  if (!fs.existsSync(docPath)) {
    console.log(`missing doc ${docPath}`);
    missingDocs++;
    continue;
  }
  const lines = fs.readFileSync(docPath, 'utf8').split('\n');
  let headFence = false;
  const bodyStart = lines.findIndex((line) => {
    if (fencePattern.test(line)) {
      headFence = !headFence;
      return false;
    }
    return !headFence && line.startsWith('## ') && line.slice(3).trim() !== '소유자 통과';
  });
  const sections = [];
  let section = null;
  let inFence = false;
  let precedingNonTableLine = '';
  let tableAnchor = '';
  let tableRows = [];
  const flushTable = () => {
    if (!tableRows.length) return;
    const separatorIndex = tableRows.findIndex((row) => tableSeparatorPattern.test(row.masked));
    const bodyRows = separatorIndex >= 1 ? tableRows.slice(separatorIndex + 1) : [];
    const allBodyRowsTagged = bodyRows.length > 0 && bodyRows.every((row) => containsId(row.masked));
    for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
      const row = tableRows[rowIndex];
      const structuralRow = separatorIndex >= 1 && (rowIndex === separatorIndex - 1 || rowIndex === separatorIndex);
      if (containsId(row.masked) || containsId(tableAnchor) || (structuralRow && allBodyRowsTagged)) continue;
      console.log(`${docPath}:${row.line} untagged: ${row.masked.slice(0, 60)}`);
      untaggedSentences++;
    }
    precedingNonTableLine = tableRows.at(-1).masked;
    tableRows = [];
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    for (const match of line.matchAll(idPattern)) {
      const item = byId.get(match[1]);
      if (!item) {
        console.log(`${docPath}:${index + 1} ${match[1]} does not exist`);
        badIds++;
      } else if (!inForce(item)) {
        console.log(`${docPath}:${index + 1} ${match[1]} is not in force (${item.상태})`);
        badIds++;
      }
    }
    if (bodyStart < 0 || index < bodyStart) continue;

    if (!inFence && sectionHeadingPattern.test(line)) {
      flushTable();
      section = { lines: [line] };
      sections.push(section);
      precedingNonTableLine = maskLine(line);
      continue;
    }
    if (section) section.lines.push(line);

    if (fencePattern.test(line)) {
      flushTable();
      inFence = !inFence;
      precedingNonTableLine = '';
      continue;
    }
    if (inFence) {
      if (line.trim()) precedingNonTableLine = '';
      continue;
    }
    if (!line.trim()) {
      flushTable();
      continue;
    }
    const masked = maskLine(line);
    if (markdownHeadingPattern.test(line)) {
      flushTable();
      precedingNonTableLine = masked;
      continue;
    }
    if (line.startsWith('|')) {
      if (!tableRows.length) tableAnchor = precedingNonTableLine;
      tableRows.push({ line: index + 1, masked });
    } else {
      flushTable();
      for (const sentence of splitSentences(masked)) {
        if (containsId(sentence)) continue;
        console.log(`${docPath}:${index + 1} untagged: ${sentence.slice(0, 60)}`);
        untaggedSentences++;
      }
      precedingNonTableLine = masked;
    }
  }
  flushTable();
  for (const currentSection of sections) {
    currentSection.text = currentSection.lines.join('\n');
    const ids = new Set([...currentSection.text.matchAll(idPattern)].map((match) => match[1]));
    for (const id of ids) {
      const citedSections = sectionsById.get(id) ?? [];
      citedSections.push(currentSection);
      sectionsById.set(id, citedSections);
    }
  }
}

let uncited = 0;
for (const item of scopedItems) {
  if (sectionsById.has(item.id)) continue;
  console.log(`uncited ${item.id} ${item.title}`);
  uncited++;
}

const exemptions = [];
const exemptPairs = new Set();
let staleExemptions = 0;
if (fs.existsSync(exemptPath)) {
  fs.readFileSync(exemptPath, 'utf8').split('\n').forEach((line, index) => {
    if (!line.trim()) return;
    const columns = line.split('\t');
    const item = byId.get(columns[0]);
    if (columns.length !== 3 || !columns[0] || !columns[1] || !reasonPattern.test(columns[2]) || !item || !inForce(item)) {
      console.log(`bad exemption ${exemptPath}:${index + 1}`);
      staleExemptions++;
      return;
    }
    const [id, token] = columns;
    exemptions.push({ id, token, line: index + 1 });
    exemptPairs.add(`${id}\u0000${token}`);
  });
}

const missingPairs = new Set();
let missingTokens = 0;
for (const item of scopedItems) {
  const sections = sectionsById.get(item.id);
  if (!sections?.length) continue;
  const citedText = sections.map((citedSection) => citedSection.text).join('\n');
  const tokens = new Map();
  for (const line of item.결정) {
    for (const [kind, pattern] of TOKEN_PATTERNS) {
      for (const match of line.matchAll(pattern)) {
        const token = match[1];
        if (kind === 'code' && (oldReferencePattern.test(token) || locationOnlyPattern.test(token))) continue;
        tokens.set(`${kind}\u0000${token}`, { kind, token });
      }
    }
  }
  for (const { kind, token } of tokens.values()) {
    if (citedText.includes(token)) continue;
    const pair = `${item.id}\u0000${token}`;
    missingPairs.add(pair);
    if (exemptPairs.has(pair)) continue;
    console.log(`missing token ${item.id} ${kind} ${token}`);
    missingTokens++;
  }
}
for (const { id, token, line } of exemptions) {
  const item = byId.get(id);
  if (!item || !inScope(item) || !sectionsById.has(id) || missingPairs.has(`${id}\u0000${token}`)) continue;
  console.log(`stale exemption ${exemptPath}:${line} ${id} ${token}`);
  staleExemptions++;
}

const problems = uncited + badIds + missingTokens + untaggedSentences + staleExemptions + missingDocs;
console.log(`docs ${docPaths.length}, items in scope ${scopedItems.length}, uncited ${uncited}, bad ids ${badIds}, missing tokens ${missingTokens}, untagged sentences ${untaggedSentences}, stale exemptions ${staleExemptions}, problems ${problems}`);
