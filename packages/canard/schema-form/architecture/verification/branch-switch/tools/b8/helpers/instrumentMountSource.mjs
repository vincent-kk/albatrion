import ts from 'typescript';

import { mountStages } from './mountStages.mjs';

/** Transform scratch input only; preserve return/throw semantics with balanced timers. */
export function instrumentMountSource(source, file, detailed = true) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [],
    sites = [],
    pending = [tree];
  for (let index = 0; index < pending.length; index++) {
    const node = pending[index];
    const name = ts.isFunctionDeclaration(node)
      ? node.name?.text
      : ts.isArrowFunction(node) && ts.isVariableDeclaration(node.parent)
        ? node.parent.name.getText(tree)
        : ts.isConstructorDeclaration(node) &&
            ts.isClassDeclaration(node.parent)
          ? node.parent.name?.text + '.constructor'
          : undefined;
    const stage = mountStages.find(
      (stage) =>
        (stage.declaredName ?? stage.name) === name &&
        (detailed || !stage.detail) &&
        (!stage.file || file.endsWith(stage.file)),
    );
    if (stage && node.body) {
      const block = ts.isBlock(node.body);
      const first = node.parameters[0]?.name;
      const argument =
        stage.pointer && first && ts.isIdentifier(first)
          ? ',' + first.text
          : '';
      const args =
        JSON.stringify(stage.name) +
        ',' +
        JSON.stringify(stage.phase) +
        argument;
      edits.push([
        node.body.getStart(tree) + (block ? 1 : 0),
        `${block ? '' : '{'}const __b8mountToken=globalThis.__b8mount.enter(${args});try{${block ? '' : 'return ('}`,
      ]);
      edits.push([
        node.body.end - (block ? 1 : 0),
        `${block ? '' : ');'}}finally{globalThis.__b8mount.exit(__b8mountToken);}${block ? '' : '}'}`,
      ]);
      sites.push({
        name: stage.name,
        phase: stage.phase,
        file,
        pointer: stage.pointer === true,
      });
    }
    ts.forEachChild(node, (child) => {
      pending.push(child);
    });
  }
  let contents = source;
  for (const [offset, insert] of edits.sort((a, b) => b[0] - a[0]))
    contents = contents.slice(0, offset) + insert + contents.slice(offset);
  return { contents, sites };
}
