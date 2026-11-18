import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { expect, it } from 'vitest';
import * as api from '../index';

/** Executes the selected published example with the package's public entry point. */
const example = (file: string, marker: string, expression: string): unknown => {
  const document = readFileSync(resolve(__dirname, '../..', file), 'utf8');
  const blocks = Array.from(document.matchAll(/```typescript\n([\s\S]*?)```/g), match => match[1]);
  const source = blocks.find(block => block.includes(marker));
  if (!source) throw new Error('Missing documented example: ' + marker);
  const exports = new Set(Object.keys(api));
  for (const match of source.matchAll(/import\s*\{([^}]+)\}/g))
    for (const binding of match[1].split(','))
      expect(exports.has(binding.trim().split(/\s+as\s+/)[0])).toBe(true);
  const code = ts.transpileModule(source + '\nexports.result = (' + expression + ');', { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const output: { result?: unknown } = {};
  runInNewContext(code, { exports: output, require: () => api, console: { log() {}, error() {} } });
  return output.result;
};

it.each(['README.md','README-ko_kr.md'])('%s compares a preserved snapshot with the in-place update', file => {
  expect(example(file, "'/settings/app/version', '1.1.0'", 'patches')).toEqual([{op:'replace',path:'/settings/app/version',value:'1.1.0'}]);
});

it.each(['README.md','README-ko_kr.md'])('%s handles missing values and malformed pointers through the public API', file => {
  expect(example(file, "'/nonexistent/path'", 'missing')).toBe(undefined);
});

it.each(['docs/en/SPECIFICATION.md','docs/ko/SPECIFICATION.md'])('%s applies its quick-start diff to the document it describes', file => {
  expect(example(file, 'const document =', 'updated')).toEqual({name:'Alice',age:31,city:'Seoul'});
});
