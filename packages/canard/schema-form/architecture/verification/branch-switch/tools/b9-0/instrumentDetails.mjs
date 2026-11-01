// Loaded by buildStages; edits affect esbuild scratch input exclusively.
import assert from 'node:assert/strict';
import path from 'node:path';
import ts from 'typescript';

export const detailStageNames = [
  'selectNodeSchema',
  'mergeEffectiveSchema',
  'selectEffectiveDeclarations',
  'registerPresenceChanges',
  'prepareGateTableRound',
  'finishGateTableRound',
  'canSkipGateWheel',
  'preserveReferences',
  'sameValue',
  'captureDetachedFieldNodeReads',
  'visitFieldNodes',
  'registryRemoval',
  'misfitIndexBuild',
  'DetachedWriteAddress.retain',
  'withdrawDetachedFills',
  'finalizePerished',
];

/** Preserve the original statement scope and every return/throw with try/finally. */
export function instrumentDetails(source, file, mode) {
  if (!['supplemental', 'diagnostic', 'gap'].includes(mode))
    return { contents: source, sites: [] };
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [],
    sites = [];
  const wrap = (node, name, block = false) => {
    const token = '__b9_' + sites.length;
    edits.push([
      node.getStart(tree) + (block ? 1 : 0),
      `{const ${token}=globalThis.__b0.enter(${JSON.stringify(name)});try{`,
    ]);
    edits.push([
      node.end - (block ? 1 : 0),
      `}finally{globalThis.__b0.exit(${token});}}`,
    ]);
    sites.push({ name, region: node.getText(tree).slice(0, 100) });
  };
  const visit = (node) => {
    if (mode === 'supplemental') {
      if (
        ts.isIfStatement(node) &&
        path.basename(file) === 'finalizeExits.ts' &&
        node.expression.getText(tree) === '!misfitIndex'
      )
        wrap(node.thenStatement, 'misfitIndexBuild', true);
      if (
        ts.isExpressionStatement(node) &&
        path.basename(file) === 'finalizeExits.ts' &&
        node.expression.getText(tree) ===
          'getGateRegistry(node.runtime).remove(node)'
      )
        wrap(node, 'registryRemoval');
      if (
        ts.isMethodDeclaration(node) &&
        path.basename(file) === 'DetachedWriteAddress.ts' &&
        node.name.getText(tree) === 'retain'
      )
        wrap(node.body, 'DetachedWriteAddress.retain', true);
    }
    if (
      mode === 'diagnostic' &&
      path.basename(file) === 'createStaticEntryReuser.ts' &&
      ts.isReturnStatement(node) &&
      node.expression &&
      ts.isArrowFunction(node.expression)
    ) {
      assert.ok(ts.isBlock(node.expression.body));
      edits.push([
        node.expression.body.getStart(tree) + 1,
        'globalThis.__b9diagnostic.staticReuserCalls++;',
      ]);
      sites.push({ name: 'staticReuserCallback' });
    }
    if (mode === 'gap') {
      const name =
        ts.isArrowFunction(node) && ts.isVariableDeclaration(node.parent)
          ? node.parent.name.getText(tree)
          : ts.isFunctionDeclaration(node)
            ? node.name?.text
            : undefined;
      if (
        ['writeFieldNode', 'runDeliveryWaves', 'deliverWave'].includes(name) &&
        node.body
      ) {
        assert.ok(ts.isBlock(node.body));
        wrap(node.body, name, true);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  let contents = source;
  for (const [offset, insert] of edits.sort((a, b) => b[0] - a[0]))
    contents = contents.slice(0, offset) + insert + contents.slice(offset);
  return { contents, sites };
}
