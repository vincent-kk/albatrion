// Count-only transformation for the scratch engine; TypeScript is supplied by the existing adapter.
export function instrumentCount(file, source, ts) {
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 const edits=[]; const sites=[];
 function visit(node) {
  if ((ts.isFunctionDeclaration(node)||ts.isMethodDeclaration(node)||ts.isConstructorDeclaration(node)||ts.isArrowFunction(node)||ts.isFunctionExpression(node)||ts.isGetAccessorDeclaration(node)||ts.isSetAccessorDeclaration(node)) && node.body) {
   const name=node.name?.getText(ast) ?? (ts.isVariableDeclaration(node.parent)?node.parent.name.getText(ast):ts.isConstructorDeclaration(node)?'constructor':'callback');
   const site=file+':'+(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1)+':'+name;
   sites.push(site);
   const call='globalThis.__111count('+JSON.stringify(site)+')';
   if(ts.isBlock(node.body)) edits.push([node.body.getStart(ast)+1,call+';']);
   else {edits.push([node.body.getStart(ast),'('+call+',']);edits.push([node.body.end,')']);}
  }
  ts.forEachChild(node,visit);
 }
 visit(ast);
 globalThis.__111sites.push(...sites);
 for(const [at,text] of edits.sort((a,b)=>b[0]-a[0])) source=source.slice(0,at)+text+source.slice(at);
 return source;
}


