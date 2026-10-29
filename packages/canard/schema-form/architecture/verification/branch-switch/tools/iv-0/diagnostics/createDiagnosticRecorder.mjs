import { classifyClosure } from './classifyClosure.mjs';
import { collectDependencyEdges } from './collectDependencyEdges.mjs';
import { compareNodes } from './compareNodes.mjs';
import { snapshotNodes } from './snapshotNodes.mjs';

/**
 * Create clock-free hooks; the injected global owns the active write stack.
 * @param {any} engine - Existing engine helpers exported only in the scratch bundle
 * @returns Recorder whose rows retain per-write observations for raw evidence
 */
export function createDiagnosticRecorder(engine) {
  const frames = [],
    rows = [],
    edgeCache = new WeakMap();
  let pendingDelivery;
  const recorder = {
    enabled: false,
    label: '',
    rows,
    begin(node, kind) {
      if (!recorder.enabled) return;
      frames.push({
        label: recorder.label,
        target: node.path,
        kind,
        before: snapshotNodes(node.rootNode),
        root: node.rootNode,
        contexts: 0,
        scratchNew: 0,
        scratchReused: 0,
        allocations: {},
        computes: {},
        computeStack: [],
        computeNonce: 0,
        rounds: [],
        roundFrames: new Map(),
        injections: [],
      });
    },
    end() {
      if (!recorder.enabled || !frames.length) return;
      const frame = frames.pop();
      if (!frame.settled)
        frame.changed = compareNodes(frame.before, snapshotNodes(frame.root));
      const branchChanges = frame.changed.filter((node) => node.branch);
      const direct = branchChanges.filter(
        (node) =>
          node.selection ||
          node.path === frame.target ||
          !branchChanges.some(
            (child) =>
              child.path !== node.path &&
              child.path.startsWith(node.path + '/'),
          ),
      );
      const hosts = direct.map((node) => node.path);
      const edges =
        edgeCache.get(frame.root.runtime.blueprint) ??
        collectDependencyEdges(frame.root, engine);
      edgeCache.set(frame.root.runtime.blueprint, edges);
      const closure = classifyClosure({
        target: frame.target,
        hosts,
        edges: [...edges, ...frame.injections],
        owners: frame.dependencyOwners ?? [],
      });
      const { before, root, roundFrames, computeStack, ...record } = frame;
      rows.push({
        ...record,
        hosts,
        propagatedHosts: branchChanges
          .filter((node) => !direct.includes(node))
          .map((node) => node.path),
        closure,
        staticEdgeCount: edges.length,
        emptyRounds: frame.rounds.filter((round) => round.changeSetSize === 0)
          .length,
      });
      pendingDelivery = { row: rows.at(-1), root: frame.root };
    },
    chainExit() {
      if (!recorder.enabled || frames.length > 0 || !pendingDelivery)
        return false;
      const { row, root } = pendingDelivery;
      frames.push({
        delivery: true,
        row,
        root,
        target: row.target,
        kind: row.kind,
        label: row.label,
        before: snapshotNodes(root),
        contexts: 0,
        scratchNew: 0,
        scratchReused: 0,
        allocations: {},
        computes: {},
        computeStack: [],
        computeNonce: 0,
        rounds: [],
        roundFrames: new Map(),
        injections: [],
      });
      return true;
    },
    chainExitEnd(token) {
      if (!token || !frames.at(-1)?.delivery) return;
      const frame = frames.pop();
      frame.row.deliveryAllocations = frame.allocations;
      frame.row.deliveryContexts = frame.contexts;
      frame.row.deliveryScratchNew = frame.scratchNew;
      frame.row.deliveryScratchReused = frame.scratchReused;
      pendingDelivery = undefined;
    },
    context(context) {
      if (!recorder.enabled) return;
      if (!frames.length) {
        recorder.begin(context.target, context.kind);
        frames.at(-1).automaticBoundary = true;
      }
      frames.at(-1).contexts++;
    },
    scratch(reused) {
      const frame = frames.at(-1);
      if (recorder.enabled && frame)
        frame[reused ? 'scratchReused' : 'scratchNew']++;
    },
    allocate(file, kind) {
      const frame = frames.at(-1);
      if (!recorder.enabled || !frame) return;
      const key = file + ':' + kind;
      frame.allocations[key] = (frame.allocations[key] ?? 0) + 1;
    },
    compute(node) {
      const frame = frames.at(-1);
      if (!recorder.enabled || !frame) return;
      frame.computes[node.path] = (frame.computes[node.path] ?? 0) + 1;
      const token = { node, id: ++frame.computeNonce };
      frame.computeStack.push(token);
      return token;
    },
    computeEnd(token) {
      if (token) frames.at(-1).computeStack.pop();
    },
    roundStart(node, context, round) {
      const frame = frames.at(-1);
      if (!recorder.enabled || !frame) return;
      const computeId = frame.computeStack.findLast(
        (entry) => entry.node === node,
      ).id;
      const previous = frame.rounds.findLast(
        (entry) => entry.computeId === computeId,
      );
      if (previous) previous.openedNext = true;
      frame.roundFrames.set(node, snapshotNodes(node));
      const open = frame.rounds.findLast(
        (entry) =>
          entry.changeSetSize === undefined && entry.computeId !== computeId,
      );
      frame.rounds.push({
        host: node.path,
        computeId,
        round,
        parentRound: open ? frame.rounds.indexOf(open) : null,
        openedNext: false,
        dirtyBefore: context.dirtyPaths.size,
      });
    },
    roundEnd(node, context, round, flags) {
      const frame = frames.at(-1);
      if (!recorder.enabled || !frame) return;
      const record = frame.rounds.findLast(
        (entry) => entry.host === node.path && entry.round === round,
      );
      const changes = compareNodes(
        frame.roundFrames.get(node),
        snapshotNodes(node),
      );
      Object.assign(record, {
        changeSetSize: changes.length,
        changedPaths: changes.map((change) => change.path),
        flags,
        dirtyAfter: context.dirtyPaths.size,
        shapeDirtyAfter: context.shapeDirtyPaths.size,
      });
      frame.roundFrames.delete(node);
    },
    inject(source, target) {
      const frame = frames.at(-1);
      if (recorder.enabled && frame)
        frame.injections.push({ source, target, kind: 'injectTo' });
    },
    settled(context) {
      const frame = frames.at(-1);
      if (!recorder.enabled || !frame) return;
      frame.changed = compareNodes(frame.before, snapshotNodes(context.root));
      frame.settled = true;
      frame.changedRaw = [...context.changedRaw];
      frame.dependencyOwners = [...context.dependencyOwnerPaths];
      frame.entered = context.entered.size;
      frame.exited = context.exited.size;
      if (frame.automaticBoundary) recorder.end();
    },
  };
  return recorder;
}
