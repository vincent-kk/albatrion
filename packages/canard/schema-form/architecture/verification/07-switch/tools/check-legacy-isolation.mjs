import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Run with Node; this tool's location determines the package source root.
const sourceRoot = fileURLToPath(new URL('../../../../src/', import.meta.url));
const legacyRoot = path.join(sourceRoot, '__legacy__');
const extensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];
// removed with the files in unit U8 (75C-01)
const EXCEPTED_LEGACY_FILES = [
  '__legacy__/core/__tests__/IfThenElse.onChange.realReact.test.tsx',
  '__legacy__/core/__tests__/NullableFormScenarios.test.tsx',
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) :
      extensions.some((extension) => filename.endsWith(extension)) ? [filename] : [];
  }).sort();
}

function decodeLiteral(value) {
  const escapes = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', 0: '\0' };
  return value.replace(/\\(?:u\{([0-9a-f]+)\}|u([0-9a-f]{4})|x([0-9a-f]{2})|(\r\n|[\s\S]))/gi,
    (_, wide, unicode, hex, character) => {
      if (wide || unicode || hex) return String.fromCodePoint(parseInt(wide || unicode || hex, 16));
      if (character === '\n' || character === '\r' || character === '\r\n') return '';
      return escapes[character] ?? character;
    });
}

function tokenize(source, start = 0, stopAtBrace = false) {
  const tokens = [];
  let position = start;
  let braces = 0;
  while (position < source.length) {
    const character = source[position];
    if (/\s/.test(character)) { position++; continue; }
    if (source.startsWith('//', position)) {
      const end = source.indexOf('\n', position + 2);
      position = end === -1 ? source.length : end + 1;
      continue;
    }
    if (source.startsWith('/*', position)) {
      const end = source.indexOf('*/', position + 2);
      position = end === -1 ? source.length : end + 2;
      continue;
    }
    if (character === '}' && stopAtBrace && braces === 0) return { tokens, end: position + 1 };
    if (character === "'" || character === '"' || character === String.fromCharCode(96)) {
      const quote = character;
      const literalStart = position++;
      let raw = '';
      let dynamic = false;
      const expressions = [];
      while (position < source.length && source[position] !== quote) {
        if (source[position] === '\\') {
          raw += source.slice(position, position + 2);
          position += 2;
        } else if (quote === String.fromCharCode(96) && source.startsWith('$' + '{', position)) {
          dynamic = true;
          const expression = tokenize(source, position + 2, true);
          expressions.push(...expression.tokens, { value: ';', kind: 'punctuation' });
          position = expression.end;
        } else raw += source[position++];
      }
      position++;
      tokens.push({ value: decodeLiteral(raw), kind: dynamic ? 'template' : 'string', start: literalStart });
      tokens.push(...expressions);
      continue;
    }
    const previous = tokens.at(-1)?.value;
    if (character === '/' && (previous === undefined ||
      ['=', '(', '[', '{', ':', ',', ';', '!', '?', 'return', 'throw', 'case', '=>', '&&', '||', '??'].includes(previous))) {
      position++;
      let inClass = false;
      while (position < source.length) {
        if (source[position] === '\\') { position += 2; continue; }
        if (source[position] === '[') inClass = true;
        if (source[position] === ']') inClass = false;
        if (source[position++] === '/' && !inClass) break;
      }
      while (/[a-z]/i.test(source[position] ?? '')) position++;
      tokens.push({ value: '<regex>', kind: 'regex' });
      continue;
    }
    if (/[a-z_$]/i.test(character)) {
      const begin = position++;
      while (/[\w$]/.test(source[position] ?? '')) position++;
      tokens.push({ value: source.slice(begin, position), kind: 'identifier', start: begin });
      continue;
    }
    const operator = ['?.', '=>', '&&', '||', '??'].find((value) => source.startsWith(value, position));
    const value = operator ?? character;
    if (value === '{') braces++;
    if (value === '}') braces--;
    tokens.push({ value, kind: 'punctuation', start: position });
    position += value.length;
  }
  return { tokens, end: position };
}

function specifiers(source) {
  const { tokens } = tokenize(source);
  const found = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.kind !== 'string') continue;
    const before = tokens[index - 1]?.value;
    let callIndex = index - 2;
    if (tokens[callIndex]?.value === '>') {
      let depth = 0;
      for (let position = callIndex; position >= 0; position--) {
        if (tokens[position].value === '>') depth++;
        if (tokens[position].value === '<' && --depth === 0) {
          callIndex = position - 1;
          break;
        }
      }
    }
    const call = tokens[callIndex]?.value;
    const method = ['mock', 'doMock', 'importActual', 'importMock'];
    const moduleCall = before === '(' && (
      (call === 'import' && !['.', '?.'].includes(tokens[callIndex - 1]?.value)) || call === 'require' ||
      (method.includes(call) && ['.', '?.'].includes(tokens[callIndex - 1]?.value) && tokens[callIndex - 2]?.value === 'vi') ||
      (call === ']' && method.includes(tokens[callIndex - 1]?.value) &&
        tokens[callIndex - 2]?.value === '[' && tokens[callIndex - 3]?.value === 'vi')
    );
    if (before === 'from' || before === 'import' || moduleCall) {
      found.push({ value: token.value, line: source.slice(0, token.start).split('\n').length });
    }
  }
  return found;
}

function isInside(filename, directory) {
  const relative = path.relative(directory, filename);
  return relative === '' || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative));
}

function resolveSpecifier(filename, specifier) {
  let base;
  if (specifier === '@/schema-form') base = sourceRoot;
  else if (specifier.startsWith('@/schema-form/')) base = path.resolve(sourceRoot, specifier.slice('@/schema-form/'.length));
  else if (specifier === '.' || specifier === '..' || specifier.startsWith('./') || specifier.startsWith('../')) base = path.resolve(path.dirname(filename), specifier);
  else return undefined;
  const candidates = [
    base,
    ...[...extensions, '.json'].map((extension) => base + extension),
    ...extensions.map((extension) => path.join(base, 'index' + extension)),
  ];
  if (/\.[cm]?jsx?$/.test(base)) {
    candidates.push(...['.ts', '.tsx', '.mts', '.cts', '.d.ts'].map((extension) => base.replace(/\.[cm]?jsx?$/, extension)));
  }
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? base;
}

const files = walk(sourceRoot);
const violations = [];
for (const filename of files) {
  const relative = path.relative(sourceRoot, filename).split(path.sep).join('/');
  const legacy = isInside(filename, legacyRoot);
  for (const specifier of specifiers(fs.readFileSync(filename, 'utf8'))) {
    const target = resolveSpecifier(filename, specifier.value);
    if (!target || !isInside(target, sourceRoot)) continue;
    const targetLegacy = isInside(target, legacyRoot);
    if (legacy === targetLegacy || (legacy && EXCEPTED_LEGACY_FILES.includes(relative))) continue;
    const direction = legacy ? 'legacy -> non-legacy' : 'non-legacy -> legacy';
    const destination = path.relative(sourceRoot, target).split(path.sep).join('/');
    violations.push('src/' + relative + ':' + specifier.line + ' ' + direction + ': ' + JSON.stringify(specifier.value) + ' -> src/' + destination);
  }
}
if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('LEGACY_ISOLATED: ' + files.length + ' files checked');
}
