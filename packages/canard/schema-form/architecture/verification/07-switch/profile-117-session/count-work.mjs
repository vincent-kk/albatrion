// Loaded only by the separate counting lane; timing bundles never contain these calls.
import assert from 'node:assert/strict';

/** Count actual listener calls, component invocations and root computation passes in memory. */
export function instrumentWork(source, file, ts) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const react = /react-dom-profiling\.profiling\.js$/.test(file);
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(ast);
      let counter;
      if (callee === 'listener') counter = 'listenerDeliveries';
      else if (react && (callee === 'Component' || /^(context|instance)\.render$/.test(callee))) counter = 'renders';
      else if (callee === 'computeNode' && /^(context\.root|root)$/.test(node.arguments[0]?.getText(ast) ?? '')) counter = 'settlePasses';
      if (counter) {
        edits.push([node.getStart(ast), `(globalThis.__work117(${JSON.stringify(counter)}), `]);
        edits.push([node.end, ')']);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (react) assert(edits.some(([, text]) => text.includes('renders')), 'React invocation anchor missing');
  for (const [at, text] of edits.sort((a, b) => b[0] - a[0])) source = source.slice(0, at) + text + source.slice(at);
  return source;
}
