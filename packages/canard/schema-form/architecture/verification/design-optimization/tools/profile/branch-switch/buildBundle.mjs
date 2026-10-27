import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/** Scratch-only instrumented stage names; basename and declaration must both match. */
export const stageNames = [
  'markWrite',
  'registerRecalculation',
  'computeNode',
  'wheelPreparation',
  'primeHost',
  'selectChildren',
  'evaluateGate',
  'runDeriveRounds',
  'transitionSettlement',
  'finalizeExits',
  'getControlLayers',
  'captureExitedRaw',
  'setLatentRaw',
  'updateOutput',
  'assembleObject',
  'commitSettlement',
  'updateInactiveValuesMemo',
  'markCommitDeliveries',
];

/** Build paired scratch source bundles, preserving source files and the shipped engine mode defaults. */
export async function buildBundle(packageDir, runDir) {
  const scratch = path.join(runDir, 'scratch');
  fs.mkdirSync(scratch, { recursive: true });
  fs.symlinkSync(
    path.resolve(packageDir, '../../../node_modules'),
    path.join(scratch, 'node_modules'),
  );
  const source = `export { buildFieldNodeTree } from ${JSON.stringify(path.join(packageDir, 'src/core/surface/utils/binding/buildFieldNodeTree.ts'))}; export { mountFieldNode } from ${JSON.stringify(path.join(packageDir, 'src/core/surface/utils/binding/mountFieldNode.ts'))}; export { registerPlugin } from ${JSON.stringify(path.join(packageDir, 'src/app/plugin/utils/registerPlugin.ts'))};`;
  const manifest = [];
  for (const wrapped of [false, true]) {
    await build({
      stdin: { contents: source, resolveDir: packageDir, loader: 'ts' },
      absWorkingDir: packageDir,
      bundle: true,
      packages: 'external',
      format: 'esm',
      platform: 'node',
      target: 'node26',
      tsconfig: path.join(packageDir, 'tsconfig.json'),
      define: { 'process.env.NODE_ENV': '"production"' },
      outfile: path.join(scratch, `${wrapped ? 'wrapped' : 'unwrapped'}.mjs`),
      plugins: wrapped
        ? [
            {
              name: 'b0-stage-timers',
              setup(builder) {
                builder.onLoad({ filter: /\.ts$/ }, (args) => {
                  const base = path.basename(args.path, '.ts');
                  if (
                    !stageNames.includes(base) &&
                    base !== 'recordGateFrameInput'
                  )
                    return;
                  let text = fs.readFileSync(args.path, 'utf8');
                  const tree = ts.createSourceFile(
                    args.path,
                    text,
                    ts.ScriptTarget.Latest,
                    true,
                    ts.ScriptKind.TS,
                  );
                  const edits = [];
                  const visit = (node) => {
                    const name = ts.isFunctionDeclaration(node)
                      ? node.name?.text
                      : ts.isArrowFunction(node) &&
                          ts.isVariableDeclaration(node.parent)
                        ? node.parent.name.getText(tree)
                        : undefined;
                    if (
                      name === base &&
                      node.body &&
                      ts.isBlock(node.body) &&
                      stageNames.includes(name)
                    ) {
                      edits.push([
                        node.body.getStart(tree) + 1,
                        `const __b0token = globalThis.__b0.enter(${JSON.stringify(name)}${name === 'evaluateGate' ? ',gate.kind' : ''});try{`,
                      ]);
                      edits.push([
                        node.body.end - 1,
                        '}finally{globalThis.__b0.exit(__b0token);}',
                      ]);
                      manifest.push({
                        name,
                        file: path.relative(packageDir, args.path),
                      });
                    }
                    ts.forEachChild(node, visit);
                  };
                  visit(tree);
                  for (const [offset, insert] of edits.sort(
                    (a, b) => b[0] - a[0],
                  ))
                    text = text.slice(0, offset) + insert + text.slice(offset);
                  if (base === 'computeNode') {
                    if (
                      !text.includes('  const staticList =') ||
                      !text.includes('  let confirmation:')
                    )
                      throw new Error('Wheel preparation anchors changed');
                    text = text
                      .replace(
                        '  const staticList =',
                        '  const wheelPreparation = () => { const __b0wheel = globalThis.__b0.enter("wheelPreparation"); try {\n  const staticList =',
                      )
                      .replace(
                        '  let confirmation:',
                        '  return { staticList, gates, seenGates, relocated, deferBaseline, cap };\n } finally { globalThis.__b0.exit(__b0wheel); } };\n const { staticList, gates, seenGates, relocated, deferBaseline, cap: __b0cap } = wheelPreparation();\n let cap = __b0cap;\n  let confirmation:',
                      );
                    manifest.push({
                      name: 'wheelPreparation',
                      file: path.relative(packageDir, args.path),
                      region:
                        'staticList through first getHostWheelBudgetCap; includes nested primeHost/initialDirty/output calls',
                    });
                  }
                  if (base === 'recordGateFrameInput') {
                    const anchor =
                      'if (!Object.is(previous.value, input.value)) frame.consistent = false;';
                    if (!text.includes(anchor))
                      throw new Error('Gate witness anchor changed');
                    text = text.replace(
                      anchor,
                      'if (!Object.is(previous.value, input.value)) { globalThis.__b0.mismatch(frame, key, previous, input); frame.consistent = false; }',
                    );
                  }
                  return { contents: text, loader: 'ts' };
                });
              },
            },
          ]
        : [],
    });
  }
  if (manifest.length !== stageNames.length)
    throw new Error(
      `Incomplete stage instrumentation: ${JSON.stringify(manifest)}`,
    );
  fs.writeFileSync(
    path.join(scratch, 'instrumentation.json'),
    JSON.stringify(manifest, null, 2),
  );
  return scratch;
}
