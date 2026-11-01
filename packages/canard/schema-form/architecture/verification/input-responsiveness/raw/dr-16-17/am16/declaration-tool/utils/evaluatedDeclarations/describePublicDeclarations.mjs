import path from 'node:path';

import { collectPublicDeclarationReferences } from './utils/collectPublicDeclarationReferences.mjs';

/** Runtime fields whose exposure would invalidate the private-state explanation. */
const changedMembers = ['validationRunning', 'validationQueued', 'validationCadence', 'validationRun', 'validationPending', 'validationSettleListeners', 'validationPendingEntryStamp', 'revealBaseline', 'revealBaselineNodes', 'revealPolicyBaseline', 'revealBaselineGeneration', 'revealDropOwed', 'revealDropTask', 'revealWriteSequence', 'revealPolicy', 'revealReleaseVersion', 'revealReleaseListeners'];

/**
 * Read each public root independently and preserve paths to selected runtime members.
 * @param directory - Built package directory with dependency resolution available.
 * @param ts - TypeScript runtime shared by both comparison programs.
 * @returns Stable signatures, per-root selection paths and unresolved aliases.
 */
export function describePublicDeclarations(directory, ts) {
  const printer = ts.createPrinter({ removeComments: true });
  const root = path.join(directory, 'dist');
  const entryPath = path.join(root, 'index.d.ts');
  const program = ts.createProgram([entryPath], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    baseUrl: directory,
    paths: { '@aileron/*': ['./dist/@aileron/*'] },
  });
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(entryPath);
  const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(entry));
  const records = new Set();
  const commentRecords = new Set();
  const commentPrinter = ts.createPrinter({removeComments:false});
  const files = new Set();
  const traces = [];
  const unresolved = [];
  for (const publicRoot of exported) {
    const pending = [{ symbol: publicRoot, trail: [publicRoot.name] }];
    const seen = new Set();
    const selections = [];
    const wholeRuntimePaths = [];
    const exposedChangedMembers = [];
    let cadenceExposed = false;
    for (let index = 0; index < pending.length; index++) {
      const { symbol, trail } = pending[index];
      if (!symbol || seen.has(symbol)) continue;
      seen.add(symbol);
      if (symbol.flags & ts.SymbolFlags.Alias) {
        const target = checker.getAliasedSymbol(symbol);
        if (!target.declarations?.length) unresolved.push({ root: publicRoot.name, alias: symbol.name });
        pending.push({ symbol: target, trail: [...trail, `alias:${symbol.name}`] });
        continue;
      }
      if (symbol.name === 'FieldNodeRuntime') wholeRuntimePaths.push(trail);
      if (symbol.name === 'ValidationCadence') cadenceExposed = true;
      if (changedMembers.includes(symbol.name)) exposedChangedMembers.push({ member: symbol.name, trail });
      for (const declaration of symbol.declarations ?? []) {
        const source = declaration.getSourceFile();
        const relative = path.relative(root, source.fileName);
        if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
        if (ts.isSourceFile(declaration) || ts.isImportDeclaration(declaration) || ts.isExportDeclaration(declaration)) continue;
        files.add(relative);
        const qualified = checker.getFullyQualifiedName(symbol).replaceAll(directory, '<package>');
        records.add(JSON.stringify([relative, qualified, printer.printNode(ts.EmitHint.Unspecified, declaration, source)]));
        commentRecords.add(JSON.stringify([relative,qualified,commentPrinter.printNode(ts.EmitHint.Unspecified,declaration,source)]));
        collectPublicDeclarationReferences(declaration, {
          ts, checker, printer, source, relative, pending, trail, selections,
        });
      }
    }
    traces.push({ publicRoot: publicRoot.name, runtimeSelections: selections, wholeRuntimePaths, exposedChangedMembers, cadenceExposed });
  }
  return { commentRecords:[...commentRecords].sort(), names: exported.map((symbol) => symbol.name).sort(), records: [...records].sort(), files: [...files].sort(), traces, unresolved };
}
