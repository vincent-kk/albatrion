import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { stageNames as originalStages } from '../../../design-optimization/tools/profile/branch-switch/buildBundle.mjs';

/** Every named stage is wrapped in a scratch copy; product files remain untouched. */
const slotStages = [
  'applyConvertedExitPolicy',
  'applySlotOverlay',
  'captureAbsentSlotInputs',
  'cloneFromSlot',
  'cloneSlotSubtree',
  'collectHostSlotValues',
  'collectSlotSourceValues',
  'commitSlotChanges',
  'compareSlotOrder',
  'createExitSlotOverlay',
  'createFromSlotOverlay',
  'createSlotValueOverlay',
  'enterSlotClone',
  'expireOccupiedSlotMemos',
  'expirePackedSlotMemos',
  'finalizeRestoredSlotRaw',
  'getRetainedChildEntry',
  'getSlotEntries',
  'getSlotEntryPosition',
  'getSlotSource',
  'hasAdditionalInactiveSources',
  'hasSlotCandidateOwner',
  'hasSlotOverlaySource',
  'isSlotEligible',
  'markRestoredSlotRaw',
  'markSlotChange',
  'materializeInactiveSlotValues',
  'preserveConvertedSlotMemos',
  'preserveSlotValueMemos',
  'pruneArraySlotTail',
  'pruneSlotSources',
  'readSlotExitPolicy',
  'readSlotRawTree',
  'readSlotValueEntry',
  'rekeyArraySlotBindings',
  'rekeySlotWriteAddresses',
  'resolveSlotSource',
  'restoreSlotSources',
  'retainClearedArrayCarriers',
  'retainExitedSlot',
  'serializeArraySlotSources',
  'updateSlotChildIndex',
  'writeSlotPath',
];

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
  'createChildNode',
  'enterFieldNode',
  'restoreLatentState',
  'createFieldNode',
  ...slotStages,
];

/** The comparative pass times only common stages and outermost entering work. */
export const ledgerNames = [
  ...originalStages,
  'createChildNode',
  'enterFieldNode',
  'restoreLatentState',
  'createFieldNode',
  'cloneFromSlot',
  'enterSlotClone',
  'createFromSlotOverlay',
];

/** Charge the same wheel region on both sides of the current prepared-host design. */
function instrumentWheel(text) {
  const start =
    '  let wheelPlan = context.hasGates ? prepareHostWheelPlan(node) : undefined;';
  const end = '  let confirmation:';
  assert.equal(text.split(start).length, 2, 'one wheel-region start');
  assert.equal(text.split(end).length, 2, 'one wheel-region end');
  return text
    .replace(
      start,
      '  const __b4prepare = () => { const __b4wheel = globalThis.__b0.enter("wheelPreparation"); try {\n' +
        start,
    )
    .replace(
      end,
      '  return { wheelPlan, gates, relocated, deferBaseline, cap };\n' +
        '  } finally { globalThis.__b0.exit(__b4wheel); } };\n' +
        '  let { wheelPlan, gates, relocated, deferBaseline, cap } = __b4prepare();\n' +
        end,
    );
}

/** Build immutable paired stage bundles and retain their complete input hashes. */
export async function buildStages(packageDir, outputDir, modulesDir) {
  const scratch = path.join(outputDir, 'scratch');
  fs.mkdirSync(scratch, { recursive: true });
  fs.symlinkSync(modulesDir, path.join(scratch, 'node_modules'));
  const source = [
    `export { buildFieldNodeTree, mountFieldNode } from ${JSON.stringify(path.join(packageDir, 'src/core/surface/index.ts'))};`,
    `export { registerPlugin } from ${JSON.stringify(path.join(packageDir, 'src/app/plugin/index.ts'))};`,
  ].join('\n');
  const manifests = { wrapped: [], supplemental: [] };
  const inputs = new Map();
  for (const mode of ['unwrapped', 'wrapped', 'supplemental']) {
    const wrapped = mode !== 'unwrapped';
    const manifest = manifests[mode];
    const names = mode === 'wrapped' ? ledgerNames : stageNames;
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
      outfile: path.join(scratch, mode + '.mjs'),
      plugins: [
        {
          name: 'retained-slot-stage-ledger',
          setup(builder) {
            builder.onLoad({ filter: /\.(?:ts|tsx)$/ }, (args) => {
              let text = fs.readFileSync(args.path, 'utf8');
              const digest = createHash('sha256').update(text).digest('hex');
              if (wrapped)
                assert.equal(
                  inputs.get(path.relative(packageDir, args.path)),
                  digest,
                  'Stage input changed between builds: ' + args.path,
                );
              inputs.set(path.relative(packageDir, args.path), digest);
              if (!wrapped)
                return {
                  contents: text,
                  loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
                };
              const base = path.basename(args.path, '.ts');
              const tree = ts.createSourceFile(
                args.path,
                text,
                ts.ScriptTarget.Latest,
                true,
              );
              const edits = [];
              const visit = (node) => {
                const name = ts.isFunctionDeclaration(node)
                  ? node.name?.text
                  : ts.isArrowFunction(node) &&
                      ts.isVariableDeclaration(node.parent)
                    ? node.parent.name.getText(tree)
                    : undefined;
                if (name && names.includes(name) && node.body) {
                  const block = ts.isBlock(node.body);
                  edits.push([
                    node.body.getStart(tree) + (block ? 1 : 0),
                    `${block ? '' : '{'}const __b4token = globalThis.__b0.${mode === 'wrapped' && !originalStages.includes(name) ? 'enterCreation' : 'enter'}(${JSON.stringify(name)}${name === 'evaluateGate' ? ',gate.kind' : ''});try{${block ? '' : 'return ('}`,
                  ]);
                  edits.push([
                    node.body.end - (block ? 1 : 0),
                    `${block ? '' : ');'}}finally{globalThis.__b0.exit(__b4token);}${block ? '' : '}'}`,
                  ]);
                  manifest.push({
                    name,
                    file: path.relative(packageDir, args.path),
                  });
                }
                ts.forEachChild(node, visit);
              };
              visit(tree);
              for (const [offset, insert] of edits.sort((a, b) => b[0] - a[0]))
                text = text.slice(0, offset) + insert + text.slice(offset);
              if (base === 'computeNode') {
                text = instrumentWheel(text);
                manifest.push({
                  name: 'wheelPreparation',
                  file: path.relative(packageDir, args.path),
                  region:
                    'prepareHostWheelPlan through initial cap, including primeHost and initial child/output work',
                });
              }
              return {
                contents: text,
                loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
              };
            });
          },
        },
      ],
    });
  }
  const hasSlotImplementation = fs.existsSync(
    path.join(
      packageDir,
      'src/core/engine/settle/utils/slots/isSlotEligible.ts',
    ),
  );
  for (const [mode, manifest] of Object.entries(manifests)) {
    for (const name of mode === 'wrapped' ? ledgerNames : stageNames) {
      const found = manifest.filter((item) => item.name === name);
      if (slotStages.includes(name) && !hasSlotImplementation) {
        assert.equal(found.length, 0, `baseline has no slot helper ${name}`);
        continue;
      }
      assert.equal(found.length, 1, `${mode}: one declaration for ${name}`);
    }
  }
  fs.writeFileSync(
    path.join(scratch, 'instrumentation.json'),
    JSON.stringify(
      {
        stages: manifests.wrapped,
        supplementalStages: manifests.supplemental,
        inputs: Object.fromEntries([...inputs].sort()),
        enteringGroup:
          'outermost creation/restoration/clone calls; nested work is counted once',
        ledgerRule:
          'B0 common timers plus conditional outermost entering boundaries, including one cloneFromSlot boundary; full helper timings belong only to the supplemental pass',
      },
      null,
      2,
    ) + '\n',
  );
  return scratch;
}
