import assert from 'node:assert/strict';
import ts from 'typescript';

import { stageNames } from '../../b9-0/buildStages.mjs';

/**
 * Add diagnostic hooks to compiler input, preserving control flow and product bytes.
 * @param {string} source - Canonical TypeScript read by esbuild
 * @param {string} file - Package-relative source identity
 * @param {'diagnostics'|'details'} mode - Clock-free observations or nested timers
 * @returns Text and a complete manifest of inserted sites
 */
export function instrumentSource(source, file, mode) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [],
    sites = [];
  const timed = [
    ...stageNames,
    'writeFieldNode',
    'createSettlementContext',
    'getSettlementScratch',
    'releaseSettlementScratch',
    'finishSettlement',
    'startFieldNodeChain',
    'enterFieldNodeChain',
    'exitFieldNodeChain',
    'runDeliveryWaves',
    'deliverWave',
    'flushQueuedEvents',
    'publishStateKeys',
    'createClearedArrayOverlay',
    'readExitLayerPolicy',
    'captureFieldNodeChange',
  ];
  const wrap = (body, name) => {
    const block = ts.isBlock(body);
    const token = '__ivToken' + sites.length;
    edits.push([
      body.getStart(tree) + (block ? 1 : 0),
      `${block ? '' : '{'}const ${token}=globalThis.__b0.enter(${JSON.stringify(name)});try{${block ? '' : 'return ('}`,
    ]);
    edits.push([
      body.end - (block ? 1 : 0),
      `${block ? '' : ');'}}finally{globalThis.__b0.exit(${token});}${block ? '' : '}'}`,
    ]);
    sites.push({ name, file });
  };
  const visit = (node) => {
    const name = ts.isFunctionDeclaration(node)
      ? node.name?.text
      : ts.isArrowFunction(node) && ts.isVariableDeclaration(node.parent)
        ? node.parent.name.getText(tree)
        : undefined;
    if (mode === 'details' && name && timed.includes(name) && node.body)
      wrap(node.body, name);
    if (
      mode === 'details' &&
      file.endsWith('/finalizeExits.ts') &&
      ts.isForOfStatement(node)
    ) {
      const text = node.getText(tree);
      const name = text.includes('context.pendingExits.values()')
        ? 'finalizePendingExitLoop'
        : text.includes('retainExitedSlot(')
          ? 'finalizeRetainLoop'
          : text.includes('affectedAncestors.add')
            ? 'finalizeAncestorCollection'
            : text.includes('updateOutput(ancestor, context)')
              ? 'finalizeAncestorOutput'
              : undefined;
      if (name) {
        const token = '__ivLoop' + sites.length;
        edits.push([
          node.getStart(tree),
          `{const ${token}=globalThis.__b0.enter(${JSON.stringify(name)});try{`,
        ]);
        edits.push([node.end, `}finally{globalThis.__b0.exit(${token});}}`]);
        sites.push({ name, file });
      }
    }
    if (
      mode === 'details' &&
      file.endsWith('/getGateRegistry.ts') &&
      ts.isMethodDeclaration(node) &&
      node.name.getText(tree) === 'remove'
    )
      wrap(node.body, 'registryRemoval');
    if (mode === 'diagnostics') {
      if (
        ts.isNewExpression(node) &&
        ['Map', 'Set'].includes(node.expression.getText(tree))
      ) {
        const kind = node.expression.getText(tree);
        edits.push([
          node.getStart(tree),
          `(globalThis.__iv.allocate(${JSON.stringify(file)},${JSON.stringify(kind)}),`,
        ]);
        edits.push([node.end, ')']);
        sites.push({ name: 'new' + kind, file });
      }
      if (name === 'writeFieldNode') {
        edits.push([
          node.body.getStart(tree) + 1,
          'globalThis.__iv.begin(node,kind);try{',
        ]);
        edits.push([node.body.end - 1, '}finally{globalThis.__iv.end();}']);
        sites.push({ name: 'writeBoundary', file });
      }
      if (name === 'computeNode') {
        edits.push([
          node.body.getStart(tree) + 1,
          'const __ivCompute=globalThis.__iv.compute(node);try{',
        ]);
        edits.push([
          node.body.end - 1,
          '}finally{globalThis.__iv.computeEnd(__ivCompute);}',
        ]);
        sites.push({ name: 'computeCall', file });
      }
      if (
        file.endsWith('/createSettlementContext.ts') &&
        ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (declaration) => declaration.name.getText(tree) === 'context',
        )
      ) {
        edits.push([node.end, ';globalThis.__iv.context(context);']);
        sites.push({ name: 'contextObject', file });
      }
      if (
        file.endsWith('/getSettlementScratch.ts') &&
        ts.isReturnStatement(node) &&
        node.expression?.getText(tree) === 'scratch'
      ) {
        edits.push([
          node.getStart(tree),
          'globalThis.__iv.scratch(scratch===cached);',
        ]);
        sites.push({ name: 'scratchObject', file });
      }
      if (
        file.endsWith('/computeNode.ts') &&
        ts.isForStatement(node) &&
        node.initializer?.getText(tree).includes('round = 0')
      ) {
        assert.ok(ts.isBlock(node.statement));
        edits.push([
          node.statement.getStart(tree) + 1,
          'globalThis.__iv.roundStart(node,context,round);',
        ]);
        sites.push({ name: 'hostRoundStart', file });
      }
      if (
        file.endsWith('/computeNode.ts') &&
        ts.isExpressionStatement(node) &&
        node.getText(tree).startsWith('finishGateTableRound(node, context)')
      ) {
        edits.push([
          node.getStart(tree),
          'globalThis.__iv.roundEnd(node,context,round,{schemaChanged,changed,outputChanged,publishedChanged});',
        ]);
        sites.push({ name: 'hostRoundEnd', file });
      }
      if (name === 'commitSettlement') {
        edits.push([node.body.getStart(tree) + 1, 'try{']);
        edits.push([
          node.body.end - 1,
          '}finally{globalThis.__iv.settled(context);}',
        ]);
        sites.push({ name: 'settledBoundary', file });
      }
      if (
        file.endsWith('/evaluateInjectTo.ts') &&
        ts.isExpressionStatement(node) &&
        node.getText(tree).startsWith('writes.push(')
      ) {
        edits.push([
          node.getStart(tree),
          'globalThis.__iv.inject(source.path,targetPath);',
        ]);
        sites.push({ name: 'injectTarget', file });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  let contents = source;
  for (const [offset, text] of edits.sort((a, b) => b[0] - a[0]))
    contents = contents.slice(0, offset) + text + contents.slice(offset);
  return { contents, sites };
}
