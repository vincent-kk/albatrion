import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const base = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');
const files = execFileSync('rg', ['--files', 'src'], { cwd: base, encoding: 'utf8' }).trim().split('\n').filter(p => /__tests__\/.*\.test\.tsx?$/.test(p));
const pattern = new RegExp(process.argv[2] ?? '.');
const bodyPattern = process.argv[3] ? new RegExp(process.argv[3]) : null;
let declarations = 0;
for (const file of files) {
  if (!pattern.test(file)) continue;
  const text = readFileSync(base + file, 'utf8');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(n) {
    if (ts.isCallExpression(n) && n.arguments.length >= 2 && ts.isStringLiteralLike(n.arguments[0])) {
      const expr = n.expression.getText(ast);
      if (/^(it|test)(\.|$)/.test(expr) && (!bodyPattern || bodyPattern.test(n.getText(ast)))) {
        declarations++;
        const line = ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1;
        console.log(JSON.stringify({ file, line, title: n.arguments[0].text, parameterized: /\.each/.test(expr), body: process.env.BODIES ? n.getText(ast) : undefined }));
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
}
console.log(JSON.stringify({ declarations }));
