import type { Example } from '../types';

/** Parse @example blocks from JSDoc, respecting code blocks (``` ... ```). */
export function parseExamples(jsdoc: string): Example[] {
  const examples: Example[] = [];
  const lines = jsdoc.split('\n');

  // Find @example tag positions, skipping occurrences inside code blocks
  const exampleStartLines: number[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const stripped = lines[i].replace(/^\s*\*\s?/, '').trim();

    if (stripped.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock && /^@example\b/.test(stripped)) {
      exampleStartLines.push(i);
    }
  }

  for (let idx = 0; idx < exampleStartLines.length; idx++) {
    const startLine = exampleStartLines[idx];

    // Find end: next @tag (outside code block) or end of JSDoc
    let endLine = lines.length;
    let blockState = false;

    for (let i = startLine + 1; i < lines.length; i++) {
      const stripped = lines[i].replace(/^\s*\*\s?/, '').trim();

      if (stripped.startsWith('```')) {
        blockState = !blockState;
        continue;
      }

      if (!blockState && /^@\w+/.test(stripped)) {
        endLine = i;
        break;
      }

      if (stripped === '*/') {
        endLine = i;
        break;
      }
    }

    const cleanLines = lines.slice(startLine + 1, endLine)
      .map(l => l.replace(/^\s*\*\s?/, '').replace(/\s*\*\/\s*$/, ''));

    const titleLines: string[] = [];
    const codeLines: string[] = [];
    let inCode = false;
    let codeFound = false;

    for (const line of cleanLines) {
      const trimmed = line.trim();
      if (!inCode && trimmed.startsWith('```')) {
        inCode = true;
        codeFound = true;
        continue;
      }
      if (inCode && trimmed.startsWith('```')) {
        inCode = false;
        continue;
      }
      if (inCode) {
        codeLines.push(line);
      } else if (!codeFound && trimmed) {
        titleLines.push(trimmed);
      }
    }

    const title = titleLines.join(' ').replace(/:$/, '').trim();
    const code = codeLines.join('\n').trim();

    if (code) {
      examples.push({ title: title || `Example ${idx + 1}`, code });
    }
  }

  return examples;
}
