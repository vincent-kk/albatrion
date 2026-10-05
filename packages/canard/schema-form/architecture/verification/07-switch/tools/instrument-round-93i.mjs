// Diagnostic instrumentation modifies only the in-memory measurement bundle.
const settlement = ['writeSchemaNode', 'loadSchemaNodeAtMount', 'loadStaticFirstTree',
  'assembleStaticFirstNode', 'finishStaticFirstLoad', 'isMissingStaticInput',
  'commitSettlement', 'transitionSettlement', 'selectChildren', 'updateOutput',
  'registerRecalculation', 'computeNode', 'isMissingRaw', 'getDependencyIndex',
  'getDeriveRuleTable', 'runDeriveRounds'];
const delivery = ['markCommitDeliveries', 'commitStaticFirstNode', 'flushQueuedEvents',
  'runDeliveryWaves', 'deliverWave', 'markSchemaNodeEvent', 'captureSchemaNodeChange'];

/** Apply the existing 65C-01 exclusive phase boundaries to both source versions. */
export function instrumentRound93i(source, relative, ts, costs = false) {
  const reactDom = /react-dom-(client\.development|profiling\.profiling)\.js$/.test(relative);
  if (!reactDom && !relative.includes('/src/core/')) return source;
  const ast = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const pending = [ast];
  while (pending.length) {
    const node = pending.pop();
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) || ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node)) && node.body && ts.isBlock(node.body)) {
      let name = node.name?.getText(ast) ?? '';
      if (ts.isConstructorDeclaration(node)) name = 'constructor';
      if (!name && ts.isVariableDeclaration(node.parent)) name = node.parent.name.getText(ast);
      const phase = reactDom ? ['renderRootSync', 'renderRootConcurrent'].includes(name) ? 'react-render' :
        ['commitRoot', 'flushMutationEffects', 'flushLayoutEffects', 'flushPassiveEffects'].includes(name) ? 'react-commit' : undefined :
        name === 'nodeFromJSONSchema' ? 'other' : name === 'blueprint' ? 'analysis' :
        name === 'createSchemaNode' ? 'creation' : settlement.includes(name) ? 'settlement' :
          ['readValidationEntry', 'compileEntryGuards', 'readSchemaNodeGuard',
            'requestSchemaNodeValidation'].includes(name) ? 'validation-registration' :
            name === 'runSchemaNodeValidation' ? 'validation-run' : delivery.includes(name) ? 'delivery' : undefined;
      if (phase && !node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword)) {
        const site = `${relative}:${name}`;
        let extra = '';
        if (name === 'computeNode')
          extra = "if (context.dirtyPaths.has(node.path)) globalThis.__r93iCount('node-calculation', node.path);";
        if (name === 'assembleStaticFirstNode')
          extra = "globalThis.__r93iCount('node-calculation', node.path);";
        if (name === 'updateOutput' || name === 'assembleStaticFirstNode')
          extra += "globalThis.__r93iCount('assembly', node.path);";
        if (name === 'commitSettlement') extra += 'globalThis.__r93iScratch(context);';
        if (name === 'loadStaticFirstTree') extra += "globalThis.__r93iCount('static-load');";
        edits.push({ position: node.body.getStart(ast) + 1,
          text: `\nconst __r93iFrame = globalThis.__r93iEnter(${JSON.stringify(phase)}, ${JSON.stringify(site)}); try { ${extra}\n` });
        edits.push({ position: node.body.end - 1,
          text: '\n} finally { globalThis.__r93iExit(__r93iFrame); }\n' });
      }
    }
    if (ts.isForOfStatement(node) && ts.isBlock(node.statement)) {
      const expression = node.expression.getText(ast);
      let key;
      if (relative.endsWith('/runDeliveryWaves.ts') && expression === 'runtime.deliveries') key = 'output-reservation-drain';
      if (relative.endsWith('/deliverWave.ts') && expression === 'pending') key = 'output-listener-snapshot';
      if (relative.endsWith('/markCommitDeliveries.ts') && expression === 'ordered') key = 'generic-commit-visitor';
      if (key) edits.push({ position: node.statement.getStart(ast) + 1,
        text: `globalThis.__r93iCount(${JSON.stringify(key)});` });
    }
    if (costs && relative.endsWith('/loadStaticFirstTree.ts') &&
      ts.isWhileStatement(node) && ts.isBlock(node.statement) &&
      node.expression.getText(ast) === 'stack.length')
      edits.push({ position: node.statement.getStart(ast) + 1,
        text: 'globalThis.__r93iFrameStack(stack);' });
    ts.forEachChild(node, child => { pending.push(child); });
  }
  edits.sort((left, right) => right.position - left.position);
  for (let index = 0; index < edits.length; index++) {
    const edit = edits[index];
    source = source.slice(0, edit.position) + edit.text + source.slice(edit.position);
  }
  return source;
}
