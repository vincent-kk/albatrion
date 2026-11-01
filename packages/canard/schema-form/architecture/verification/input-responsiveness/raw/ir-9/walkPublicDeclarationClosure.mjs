import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';

/** Hash a complete, sorted declaration tree, including each relative filename. */
const hashTree = (files) => {
  const hash = createHash('sha256');
  for (const [name, text] of [...files].sort(([a], [b]) => a.localeCompare(b)))
    hash.update(name).update('\0').update(text).update('\0');
  return hash.digest('hex');
};

/** The checker sees identical virtual filenames while reading each committed snapshot. */
const inspect = (repository, packageRoot, revision) => {
  const scratch = mkdtempSync(resolve(tmpdir(), 'onerror-declarations-'));
  const packagePath = relative(repository, packageRoot).split(sep).join('/');
  try {
    const archive = execFileSync('git', ['archive', revision, `${packagePath}/src`], {
      cwd: repository,
      maxBuffer: 128 * 1024 * 1024,
    });
    execFileSync('tar', ['-xf', '-', '-C', scratch], { input: archive });
    const snapshot = resolve(scratch, packagePath);
    const redirect = (file) => {
      const rel = relative(packageRoot, resolve(file));
      return rel === 'src' || rel.startsWith(`src${sep}`) ? resolve(snapshot, rel) : file;
    };
    const configuration = ts.readConfigFile(resolve(packageRoot, 'tsconfig.declarations.json'), ts.sys.readFile);
    if (configuration.error) throw new Error('Cannot read the declaration configuration');
    const configHost = {
      ...ts.sys,
      readDirectory: (root, extensions, excludes, includes, depth) =>
        ts.sys.readDirectory(snapshot, extensions, excludes, includes, depth)
          .map((file) => resolve(packageRoot, relative(snapshot, file))),
    };
    const config = ts.parseJsonConfigFileContent(configuration.config, configHost, packageRoot);
    const options = { ...config.options, noEmit: false, emitDeclarationOnly: true, declaration: true, incremental: false };
    const host = ts.createCompilerHost(options);
    host.readFile = (file) => ts.sys.readFile(redirect(file));
    host.fileExists = (file) => ts.sys.fileExists(redirect(file));
    host.directoryExists = (directory) => ts.sys.directoryExists(redirect(directory));
    host.getSourceFile = (file, languageVersion) => {
      const text = host.readFile(file);
      return text === undefined ? undefined : ts.createSourceFile(file, text, languageVersion, true);
    };
    const emitted = new Map();
    host.writeFile = (file, text) => {
      if (!file.endsWith('.d.ts')) return;
      const name = relative(resolve(packageRoot, 'dist'), file).split(sep).join('/');
      if (isAbsolute(name) || name.startsWith('../')) throw new Error('Declaration escaped the package tree');
      emitted.set(name, text);
    };
    const program = ts.createProgram(config.fileNames, options, host);
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(resolve(packageRoot, 'src/index.ts'));
    if (!source) throw new Error('Missing package entry point');
    const module = checker.getSymbolAtLocation(source);
    if (!module) throw new Error('Missing entry-point module symbol');
    const exports = checker.getExportsOfModule(module).sort((a, b) => a.name.localeCompare(b.name));
    const rows = new Map();
    const reached = new Set();
    const signatures = new Set();
    const seen = new Map();
    let signatureCount = 0;
    let typeArgumentCount = 0;
    const local = (declaration) => {
      const file = declaration.getSourceFile().fileName;
      return file.startsWith(resolve(packageRoot, 'src') + sep);
    };
    const owner = (declaration) => {
      let node = declaration.parent;
      while (node && !((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node) || ts.isEnumDeclaration(node)) && node.name)) node = node.parent;
      return node?.name?.getText() ?? relative(packageRoot, declaration.getSourceFile().fileName).split(sep).join('/');
    };
    const visit = (type, depth) => {
      if (!type || depth > 7 || (seen.get(type) ?? Infinity) <= depth) return;
      seen.set(type, depth);
      const typeSymbol = type.aliasSymbol ?? type.getSymbol();
      if (typeSymbol?.declarations?.some(local)) reached.add(typeSymbol.name);
      for (const member of checker.getPropertiesOfType(type)) {
        const declaration = member.declarations?.find(local);
        if (!declaration) continue;
        const name = owner(declaration) + '.' + member.name;
        const memberType = checker.getTypeOfSymbolAtLocation(member, declaration);
        const annotation = declaration.type?.getText().replace(/\s+/g, ' ').trim()
          ?? checker.typeToString(memberType, declaration, ts.TypeFormatFlags.NoTruncation);
        const optional = member.flags & ts.SymbolFlags.Optional ? '?' : '';
        const key = relative(packageRoot, declaration.getSourceFile().fileName).split(sep).join('/') + '#' + name;
        rows.set(key, `${name}${optional}: ${annotation}`);
        visit(memberType, depth + 1);
      }
      for (const signature of [...type.getCallSignatures(), ...type.getConstructSignatures()]) {
        signatureCount++;
        if (signature.declaration && local(signature.declaration))
          signatures.add(owner(signature.declaration) + ': ' + checker.signatureToString(signature, signature.declaration, ts.TypeFormatFlags.NoTruncation));
        for (const parameter of signature.parameters) {
          const declaration = parameter.valueDeclaration ?? parameter.declarations?.[0] ?? signature.declaration;
          if (declaration) visit(checker.getTypeOfSymbolAtLocation(parameter, declaration), depth + 1);
        }
        visit(signature.getReturnType(), depth + 1);
        visit(checker.getTypePredicateOfSignature(signature)?.type, depth + 1);
        for (const parameter of signature.typeParameters ?? []) visit(parameter, depth + 1);
      }
      for (const part of type.types ?? []) visit(part, depth + 1);
      const arguments_ = [...(type.aliasTypeArguments ?? []), ...(type.flags & ts.TypeFlags.Object && type.objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(type) : [])];
      for (const argument of arguments_) {
        typeArgumentCount++;
        visit(argument, depth + 1);
      }
    };
    for (const exported of exports) {
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      if (!declaration) throw new Error(`Export without declaration: ${exported.name}`);
      const type = symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias) ? checker.getDeclaredTypeOfSymbol(symbol) : checker.getTypeOfSymbolAtLocation(symbol, declaration);
      for (const signature of [...type.getCallSignatures(), ...type.getConstructSignatures()])
        signatures.add(exported.name + ': ' + checker.signatureToString(signature, declaration, ts.TypeFormatFlags.NoTruncation));
      visit(type, 0);
    }
    const result = program.emit();
    if (result.emitSkipped || !emitted.size) throw new Error('Declaration emission failed');
    return {
      rows: Object.fromEntries([...rows].sort(([a], [b]) => a.localeCompare(b))),
      exports: exports.map((symbol) => symbol.name),
      reached: [...reached].sort(),
      signatures: [...signatures].sort(),
      signatureCount,
      typeArgumentCount,
      depth: 7,
      tree: emitted,
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
};

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const packageRoot = resolve(repository, 'packages/canard/schema-form');
const output = resolve(repository, option('--out', relative(repository, dirname(fileURLToPath(import.meta.url)))));
const baseline = option('--base', 'f4018e82b');
const candidate = execFileSync('git', ['rev-parse', option('--head', 'HEAD')], { cwd: repository, encoding: 'utf8' }).trim();
const base = inspect(repository, packageRoot, baseline);
const head = inspect(repository, packageRoot, candidate);
if (JSON.stringify(base.exports) !== JSON.stringify(head.exports)) throw new Error('Public export names changed');
if (JSON.stringify(base.signatures) !== JSON.stringify(head.signatures)) throw new Error('Public signatures changed');
const removed = Object.keys(base.rows).filter((key) => base.rows[key] !== head.rows[key]).map((key) => '- ' + base.rows[key]);
const added = Object.keys(head.rows).filter((key) => base.rows[key] !== head.rows[key]).map((key) => '+ ' + head.rows[key]);
const diff = [...removed, ...added].join('\n') + '\n';
const expected = '- FormErrorRecord.aggregate?: SchemaFormError\n- FormErrorRecord.surface?: FormErrorSurface\n+ FormErrorRecord.origin: FormErrorOrigin\n';
if (diff !== expected) throw new Error('Unexpected public closure diff:\n' + diff);
writeFileSync(resolve(output, 'public-declaration.diff'), diff);
const changed = [...new Set([...base.tree.keys(), ...head.tree.keys()])].filter((name) => base.tree.get(name) !== head.tree.get(name)).sort();
const publicCarriers = ['errors/index.d.ts', 'errors/type.d.ts'];
const compact = ({ tree, ...rest }) => JSON.parse(JSON.stringify(rest).split(packageRoot).join('package:').split(repository).join('repository:'));
for (const [name, report] of [['base', base], ['head', head]]) writeFileSync(resolve(output, `public-closure-${name}.json.gz`), gzipSync(JSON.stringify(compact(report))));
writeFileSync(resolve(output, 'public-declaration.json'), JSON.stringify({
  baseline,
  walker_input_commit: candidate,
  algorithm: 'TypeScript checker; every package export, package-declared properties, signatures, predicates and type arguments; depth 7; full tsc declaration emission before alias post-processing',
  depth: 7,
  export_count: head.exports.length,
  base_tree_sha256: hashTree(base.tree),
  head_tree_sha256: hashTree(head.tree),
  base_declaration_count: base.tree.size,
  head_declaration_count: head.tree.size,
  changed_public_declaration_carriers: changed.filter((name) => publicCarriers.includes(name)),
  changed_internal_declaration_files: changed.filter((name) => !publicCarriers.includes(name)),
  public_changes: [...removed, ...added],
  internal_names_not_reached: ['FieldNodeRuntime', 'batchFieldNodeLoad', 'PendingFormErrorRecord', 'FormErrorService'].filter((name) => !head.reached.includes(name)),
}, null, 2) + '\n');
console.log(`PUBLIC_CLOSURE_OK exports=${head.exports.length} properties=${Object.keys(head.rows).length} changes=3 declarations=${base.tree.size}/${head.tree.size}`);
