import { posix } from 'node:path';
import ts from 'typescript';

/** Private asset; package exports deliberately expose no address for it. */
const BRIDGE_FILE = '_runtime/react-jsx-runtime.cjs';
/** Static property assignments expose named exports to Node's CJS module lexer. */
const BRIDGE_SOURCE = `const runtime = require('react/jsx-runtime');
exports.jsx = runtime.jsx;
exports.jsxs = runtime.jsxs;
exports.Fragment = runtime.Fragment;
`;

/**
 * Bridge the reviewed React peer range's JSX imports through CommonJS resolution.
 * @param {string} reactPeerRange Actual package peer range; only the reviewed legacy range is admitted.
 * @returns {import('rolldown').Plugin} An ESM-only opt-in plugin, with no public export changes.
 * @throws {RangeError} If a changed range needs a new compatibility decision.
 */
export function createReactJsxRuntimeBridge(reactPeerRange) {
  if (reactPeerRange !== '>=16.14 <20')
    throw new RangeError('React peer range must be reviewed before enabling the JSX runtime bridge');
  let used = false;
  return {
    name: 'legacy-react-jsx-runtime',
    buildStart() { used = false; },
    renderChunk(code, chunk) {
      if (!code.includes('react/jsx-runtime')) return null;
      const source = ts.createSourceFile(chunk.fileName, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
      let result = code;
      for (let index = source.statements.length - 1; index >= 0; index--) {
        const statement = source.statements[index];
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== 'react/jsx-runtime') continue;
        let relative = posix.relative(posix.dirname(chunk.fileName), BRIDGE_FILE);
        if (!relative.startsWith('.')) relative = './' + relative;
        result = result.slice(0, statement.moduleSpecifier.getStart(source)) + JSON.stringify(relative) + result.slice(statement.moduleSpecifier.end);
        used = true;
      }
      return result === code ? null : { code: result, map: null };
    },
    generateBundle() {
      if (used) this.emitFile({ type: 'asset', fileName: BRIDGE_FILE, source: BRIDGE_SOURCE });
    },
  };
}
