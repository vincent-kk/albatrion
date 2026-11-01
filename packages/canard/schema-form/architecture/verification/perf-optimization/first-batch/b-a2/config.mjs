// Imported by the B/A2 runners, builders, summarizer and b2 tools for measurement paths and pinned identities.
// Scratch benchmark configuration; all generated paths are relative to this file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const SB = path.dirname(fileURLToPath(import.meta.url));
export const W = process.env.MEASURE_WORKTREE ?? path.resolve(SB, '../../../../../../../..');
export const P = path.join(W, 'packages/canard/schema-form');
export const NODE = process.env.NODE_BIN ?? 'node';
export const sources = {
  current: path.join(P, 'dist/index.mjs'),
  legacy: path.join(W, 'node_modules/@canard/schema-form_0.16.1/dist/index.mjs'),
};
export const expectedSha = {
  current: 'e27de23ccc14a8bf9c91e49007ee0f1751c2b7ccc53cf0924f07ae2c4a29040a',
  legacy: '5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46',
};
export const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const runtime = () => ({ name: process.versions.bun ? 'bun' : 'node', version: typeof Bun === 'undefined' ? process.version : Bun.version, versions: process.versions });
export const sourceVersion = (engine) => JSON.parse(fs.readFileSync(engine === 'current' ? path.join(P, 'package.json') : path.join(W, 'node_modules/@canard/schema-form_0.16.1/package.json'), 'utf8')).version;
export const currentExports = ['blueprint', 'fieldNodeFactory', 'PathKeyedMap', 'PathKeyedSet', 'mountFieldNode', 'writeFieldNodeInput', 'buildFieldNodeTree'];
export const legacyExports = ['nodeFromJSONSchema'];
export const requiredCurrent = ['markWrite', 'registerRecalculation', 'nextExtras', 'keepsHostKeys', 'selectChildren', 'primeHost', 'computeNode', 'computeStableNode', 'updateOutput', 'assembleObject', 'preserveReferences', 'sameValue', 'finishSettlement', 'transitionSettlement', 'commitSettlement', 'markCommitDeliveries', 'commitGlobalState', 'runDeliveryWaves', 'flushQueuedEvents', 'exitFieldNodeChain', 'writeFieldNode', 'dispatchSetValue'];
export const currentStages = {
  admission: ['markWrite', 'nextExtras', 'keepsHostKeys', 'admitsSameValueWrite', 'getDeclaredChildNames', 'staticSpec'],
  distribution: ['registerRecalculation', 'getChildDistribution', 'hasDistributedChildInput', 'distributeAbsentChildInputs', 'distributeLatentValue', 'distributeMovedLatentInput', 'arrayExtras', 'copyArraySlots', 'arrangeBranchArray', 'readRawTree', 'readRawSlots', 'applyArraySlots', 'applyArrayTail', 'applyArraySplice', 'prepareArrayAppend', 'prepareArrayPop', 'prepareArraySplice', 'rekeyArrayRuntimePaths', 'getItemEntries', 'getItemEntry'],
  selection: ['selectChildren', 'primeHost', 'selectNodeSchema', 'declareArrayChildren', 'getArrayItemTemplate'],
  compute: ['computeNode', 'computeStableNode', 'updateOutput', 'assembleObject', 'assembleArray', 'preserveReferences', 'sameValue', 'writeObjectKey'],
  commit: ['finishSettlement', 'transitionSettlement', 'commitSettlement', 'markCommitDeliveries', 'commitGlobalState', 'publishStateKeys', 'commitExitPolicyValues'],
  delivery: ['runDeliveryWaves', 'flushQueuedEvents', 'exitFieldNodeChain'],
  envelope: ['writeFieldNode', 'dispatchSetValue', 'arrangeFieldNodeItems', 'createSettlementContext'],
};
export const legacyStages = {
  admission: ['AbstractNode.setValue', 'ObjectNode.applyValue', 'BranchStrategy.applyValue', 'AbstractNode.__equals__', 'ObjectNode.__equals__'],
  distribution: ['BranchStrategy.__propagate__', 'NumberNode.applyValue'],
  selection: ['BranchStrategy.__processChildren__', 'BranchStrategy.__processOneOfChildren__', 'BranchStrategy.__processAnyOfChildren__', 'BranchStrategy.__primeInitialBranch__'],
  compute: ['BranchStrategy.__parseValue__', 'BranchStrategy.__processValue__', 'NumberNode.__parseValue__', 'NumberNode.__equals__', 'getDerivedValueFactory', 'processValueWithCondition'],
  commit: ['BranchStrategy.__emitChange__', 'BranchStrategy.__handleEmitChange__', 'NumberNode.__emitChange__', 'AbstractNode.__markIntendedWrite__', 'AbstractNode.__setGlobalState__'],
  delivery: ['AbstractNode.onChange', 'AbstractNode.publish', 'EventCascadeManager.publish', 'EventCascadeManager.dispatch', 'EventCascadeManager.__acquireBatch__', 'EventCascadeManager.__resolve__', 'EventCascadeManager.__recordDelivery__', 'BranchStrategy.handleChangeFactory.callback'],
};
export const pairing = Object.keys(legacyStages).map((stage) => ({ stage, current: currentStages[stage], legacy: legacyStages[stage].map((name) => name === 'BranchStrategy.handleChangeFactory.callback' ? 'BranchStrategy constructor: handleChangeFactory (returned callback)' : name), estimate: true }));
export function identity(engine, filename) {
  return { engine, version: sourceVersion(engine), engineSha256: sha(fs.readFileSync(sources[engine])), bundle: filename, bundleSha256: sha(fs.readFileSync(path.join(SB, filename))) };
}
