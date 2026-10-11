// Loaded by measure-react.mjs only for separate, in-memory phase diagnosis.

/** Wrap synchronous core bodies while preserving the existing named phase boundaries. */
export function instrumentCore(source, filename, ts, legacy = false) {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true,
    filename.endsWith('.tsx') ? ts.ScriptKind.TSX : filename.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS);
  const regions = [...source.matchAll(/^\/\/#region ([^\n]+)$/gm)]
    .map(match => ({ start: match.index, path: match[1] }));
  const edits = [];
  const visit = node => {
    const callable = ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) || ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node);
    if (callable && node.body && ts.isBlock(node.body) &&
      !node.asteriskToken && !node.modifiers?.some(item => item.kind === ts.SyntaxKind.AsyncKeyword)) {
      const region = legacy ? regions.findLast(item => item.start <= node.getStart(ast)) : undefined;
      const core = legacy ? region?.path.startsWith('src/core/') : filename.includes('/src/core/');
      const ownBody = node.body.statements[0]?.getText(ast) ?? '';
      if (core && !ownBody.includes('__r93iEnter')) {
        const name = node.name?.getText(ast) ?? (ts.isConstructorDeclaration(node) ? 'constructor' : 'callback');
        const location = region?.path ?? filename;
        const phase = /Validation/.test(location) ? 'validation-registration' :
          /EventCascade/.test(location) ? 'delivery' :
          /ComputedProperties/.test(location) ? 'settlement' : 'core-other';
        edits.push({ at: node.body.getStart(ast) + 1, order: 1,
          text: `const __g26Core = globalThis.__r93iEnter(${JSON.stringify(phase)}, ${JSON.stringify(location + ':' + name)}); try {` });
        edits.push({ at: node.body.end - 1, order: 0,
          text: '} finally { globalThis.__r93iExit(__g26Core); }' });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  for (const edit of edits.sort((left, right) => right.at - left.at || left.order - right.order))
    source = source.slice(0, edit.at) + edit.text + source.slice(edit.at);
  return source;
}
