// Invoked by count tests; adapt the read-only diagnostic runner, never product source.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = fileURLToPath(new URL('../../../../../../', import.meta.url));
const tools = resolve(packageRoot, 'architecture/verification/07-switch/tools');
let runner = readFileSync(resolve(tools, 'measure-react-render-counts.mjs'), 'utf8');
runner = runner
  .replace("import { prepareReactBundles } from './prepare-react-bundles.mjs';",
    'import { prepareReactBundles } from ' + JSON.stringify(pathToFileURL(resolve(tools, 'prepare-react-bundles.mjs')).href) + ';')
  .replace("const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');",
    'const packageRoot = ' + JSON.stringify(packageRoot) + ';')
  .replace("const countsOnly = output === '--counts-only';", 'const countsOnly = true;')
  .replace('...(countsOnly ? [] : [', '...[')
  .replace('      ]),\n    ] : [', '      ],\n    ] : [')
  .replace('globalThis.__faCommit =',
    "globalThis.__faLayout = () => { if (counting) log.push({ kind: 'layout' }); };\nglobalThis.__faCommit =")
  .replace('  module._compile(source, filename);',
    "  source = replaceOnce(source, '          lastEffect = create();', '          if (flags & 4) globalThis.__faLayout();\\\n          lastEffect = create();');\n  module._compile(source, filename);")
  .replace('        fibersVisited:',
    "        layoutEffects: log.filter(event => event.kind === 'layout').length,\n        fibersVisited:");
try {
  await import('data:text/javascript;base64,' + Buffer.from(runner).toString('base64'));
} catch (error) {
  console.error(error.name + ': ' + error.message);
  process.exitCode = 1;
}
