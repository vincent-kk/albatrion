// Count-only scratch transformation. Authored loop bodies and function boundaries keep their order.
export function instrumentVisits(file, source, ts, sites) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const site = (node, name) => `${file}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}:${name}`;
  const args = node => node.parameters.filter(p => ts.isIdentifier(p.name)).map(p => p.name.getText(ast)).join(',');
  function visit(node) {
    if (file.endsWith('/evaluateGate.ts') && ts.isCallExpression(node) &&
      node.expression.getText(ast) === 'expression.evaluate') {
      const key = site(node, 'expression.evaluate'); sites.push(key);
      edits.push([node.getStart(ast), `(globalThis.__112hit(${JSON.stringify(key)},[gate]),`]);
      edits.push([node.end, ')']);
    }
    const callable = ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node) ||
      ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node);
    if (callable && node.body) {
      const name = node.name?.getText(ast) ?? (ts.isVariableDeclaration(node.parent)
        ? node.parent.name.getText(ast) : ts.isConstructorDeclaration(node) ? 'constructor' : 'callback');
      const key = site(node, name); sites.push(key);
      const values = `[${args(node)}]`;
      if (ts.isBlock(node.body)) {
        if (node.body.statements.length === 0)
          edits.push([node.body.getStart(ast) + 1, `globalThis.__112hit(${JSON.stringify(key)},${values});`]);
        else {
          edits.push([node.body.getStart(ast) + 1, `const __112f=globalThis.__112enter(${JSON.stringify(key)},${values});try{`]);
          edits.push([node.body.end - 1, '}finally{globalThis.__112exit(__112f);}']);
        }
      } else {
        edits.push([node.body.getStart(ast), `(globalThis.__112hit(${JSON.stringify(key)},${values}),`]);
        edits.push([node.body.end, ')']);
      }
    }
    if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)) {
      const key = site(node, 'loop'); sites.push(key);
      const body = node.statement;
      let value = 'undefined', at = body.getStart(ast);
      if (!ts.isForStatement(node) && ts.isVariableDeclarationList(node.initializer)) {
        const name = node.initializer.declarations[0]?.name;
        if (name && ts.isIdentifier(name)) value = name.getText(ast);
      }
      if (ts.isBlock(body)) {
        at++;
        const first = body.statements[0];
        if (first && ts.isVariableStatement(first)) {
          const declaration = first.declarationList.declarations[0];
          if (declaration && ts.isIdentifier(declaration.name)) {
            value = declaration.name.getText(ast); at = first.end;
          }
        }
        edits.push([at, `const __112l=globalThis.__112enter(${JSON.stringify(key)},[${value}]);try{`]);
        edits.push([body.end - 1, '}finally{globalThis.__112exit(__112l);}']);
      } else {
        edits.push([at, `{const __112l=globalThis.__112enter(${JSON.stringify(key)},[${value}]);try{`]);
        edits.push([body.end, '}finally{globalThis.__112exit(__112l);}}']);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const [at, text] of edits.sort((a, b) => b[0] - a[0])) source = source.slice(0, at) + text + source.slice(at);
  return source;
}
