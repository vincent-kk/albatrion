// Imported by table.mjs to classify measured labels using read-only ledger and bundle evidence.
// Read-only classification evidence. Exact original quotations accompany English explanations.
import fs from 'node:fs';
import { P, SB } from '../config.mjs';

export const A = '(a)';
export const B = '(b)';
export const C = '(c)';
export const classNames = {
  [A]: "absent from 0.16.1's single propagation pass",
  [B]: 'contract-required per node',
  [C]: 'unclassified',
};
function quote(file, needle, id, translation) {
  const lines = fs.readFileSync(P + '/' + file, 'utf8').split('\n');
  const line = lines.findIndex((value) => value.includes(needle));
  if (line < 0) throw new Error('Missing evidence quotation ' + id);
  return { id, file, line: line + 1, quote: needle, translation };
}
export const evidence = {
  order: quote('architecture/ledger/settle.md', '**표시부터 커밋까지는 동기·단방향이다.**', 'SETTLE-001', 'Marking through commit is synchronous and unidirectional.'),
  marking: quote('architecture/ledger/settle.md', '쓰기를 받은 노드의 `raw`·`extras`를 갱신하고 조상 경로의 재계산 목록에 등록한다', 'SETTLE-002', 'Update raw/extras of written nodes and register ancestor recalculation.'),
  compute: quote('architecture/ledger/settle.md', '재계산 목록의 자식을 먼저 완료한 뒤 자기 `local`·`emit`·유효 스키마를 만든다.', 'SETTLE-003', 'Complete recalculated children before producing local, emit and effective schema.'),
  stable: quote('src/core/engine/settle/DETAIL.md', '각 노드의 dirty 확인·stateDirty 표시·자식 post-order·동일 updateOutput 인자·dirty 삭제와 터미널 루트의 schema 선택은 유지한다.', 'stable-compute', 'Retain per-node dirty checks, state-dirty marks, child post-order, updateOutput arguments, dirty deletion and terminal-root schema selection.'),
  dirty: quote('src/core/engine/settle/DETAIL.md', 'dirty 경로는 일반 add/delete 색인으로 시작하고 게이트 없는 등록 경계에서 최초 descendant 순서를 유지한 직접 에지 색인으로 전환한다.', 'dirty-index', 'Dirty paths start with the general add/delete index and switch to direct edges at the gate-free registration boundary, preserving first-descendant order.'),
  reference: quote('architecture/ledger/value.md', '새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다', 'VALUE-012', 'Keep the previous reference when ordered keys and child emit references match.'),
  revision: quote('architecture/ledger/event.md', '`revision`은 **커밋 시 배달 집합 전체를 한 번에** 올린다', 'EVENT-007', 'Advance revisions for the whole delivery set together at commit.'),
  payload: quote('architecture/ledger/event.md', '`UpdateValue`의 payload는 커밋 시점의 `{previous, current}`이며 호스트는 `local`과 `emit`을 둘 다 싣는다.', 'EVENT-023', 'UpdateValue has committed previous/current values, with both local and emit for hosts.'),
  previous: quote('architecture/ledger/event.md', '`previous`는 **그 노드에 마지막으로 통지한 값**이다.', 'EVENT-024', 'Previous means the value last delivered for that node.'),
  payloadImmutable: quote('architecture/ledger/event.md', 'payload는 **불변**이다.', 'EVENT-024 immutable', 'Payloads are immutable.'),
  known: quote('src/core/engine/settle/DETAIL.md', '값이 다른 잎 자식은 그 해석 값을 `markWrite`에 넘기고, `markWrite`는 그 자식을 다시 해석하거나 비교하지 않고 바뀐 것으로 기록한다.', 'known-child input', 'Pass the interpreted unequal leaf value to markWrite, which records it without interpreting or comparing again.'),
  feature: quote('src/core/engine/settle/DETAIL.md', '기능 선언이 없으면 방문은 0이다.', 'feature-index', 'Visit no feature nodes when the feature is absent.'),
  interpret: quote('src/core/engine/settle/DETAIL.md', '그 자식에서는 dirty 표시·`writtenInputs` 기록·재계산 등록·계산·비교가 빠지고, 입력 크기 K의 해석·비교 한 번은 남는다.', 'one leaf interpretation', 'Skipping unchanged leaves retains one interpretation/comparison over the input.'),
  terminal: quote('architecture/ledger/value.md', '**3. 저장되는 값은 자식 노드가 없는 노드에만 있다** — 터미널 타입(string·number·boolean·null)과 터미널 전략의 object·array.', 'VALUE-004', 'Stored values belong to terminal types and terminal object/array strategies.'),
  commitOrder: quote('src/core/engine/settle/DETAIL.md', '커밋 배달은 global-state 후보를 먼저 방문하고 그 기존 membership에 없는 추가 후보를 삽입 순서대로 한 번씩 방문한다.', 'commit candidate order', 'Visit global-state candidates first, then additional candidates outside that membership once in insertion order.'),
  misfit: quote('architecture/ledger/value.md', '`valueTypeMismatch = raw !== undefined && !(raw === null && nullable) && !isMemberOfEffectiveList(raw)`이며, 원본과 노드의 현재 spec만의 함수다.', 'VALUE-037 membership', 'Misfit is determined by raw membership in the current effective type list, allowing undefined and nullable null.'),
  misfitRecompute: quote('architecture/ledger/value.md', '경고등은 커밋 때 원본이 바뀐 노드와, 같은 정착에서 유효 스키마가 바뀐 노드에서 다시 계산한다.', 'VALUE-037 recompute', 'Recompute misfit at commit for nodes with changed raw or effective schema.'),
  misfitPath: quote('architecture/ledger/value.md', '경고등은 그 노드의 경로가 루트의 경로 집합에 들어가는 커밋에 켜진다(ERROR-186).', 'VALUE-037 path set', 'Misfit becomes active when the node path enters the root path set at commit.'),
  globalCounts: quote('architecture/ledger/event.md', '런타임은 키마다 참인 노드의 수를 든다.', 'EVENT-062', 'The runtime maintains the count of true nodes per state key.'),
  hostKeys: quote('src/core/engine/settle/DETAIL.md', '객체는 입력의 모든 키가 정의된 값을 가지고 직전 `local`에 있어야 하며, 교체 쓰기이면 키 수도 직전 `local`과 같아야 한다(Merge는 입력 키가 모두 직전 `local`에 있으면 된다).', 'static host key preservation', 'Object inputs must contain defined keys already present in the previous local, with equal key counts for replacement writes.'),
};
const legacySource = fs.readFileSync(SB + '/legacy-source.mjs', 'utf8');
function legacyQuote(needle, symbol, after) {
  const lines = legacySource.split('\n'), start = after ? lines.findIndex((line) => line.includes(after)) : 0;
  const index = lines.findIndex((line, i) => i >= start && line.includes(needle));
  if (index < 0) throw new Error('Missing legacy pairing evidence: ' + needle);
  return { symbol, file: '../legacy-source.mjs', line: index + 1, quote: needle };
}
export const legacy = [
  legacyQuote('node.setValue(nextValue, propagateOption);', 'BranchStrategy.__propagate__'),
  legacyQuote('var NumberNode = class extends AbstractNode', 'NumberNode.applyValue / NumberNode.__emitChange__ / NumberNode.__parseValue__'),
  legacyQuote('return parseNumber(input, this.schemaType === "integer");', 'NumberNode.__parseValue__', 'var NumberNode = class'),
  legacyQuote('setValue(input, option = SetValueOption.Overwrite)', 'AbstractNode.setValue'),
  legacyQuote('var EventCascadeManager = class', 'EventCascadeManager.publish / __resolve__ / __recordDelivery__'),
];
function result(classification, why, citations = []) { return { classification, why, citations }; }
export function baseClassify(label, group) {
  const { name, owner, kind } = label;
  if (name === 'markWrite.default staticSpec [already-interpreted child]') return result(A, 'The numeric child value was already interpreted using staticSpec in the host loop. Recursion passes that known value but spec=undefined evaluates the default lookup again; the body never consumes it. Legacy BranchStrategy.__propagate__ calls NumberNode.applyValue and its direct __parseValue__ path, with no second staticSpec lookup.', [evidence.known]);
  if (name === group) return result(C, 'Root envelope mixes required semantics, implementation bookkeeping and instrumentation overhead; classify its children separately.');
  if (owner.startsWith('DirtyPathSet.') || owner === 'dirtyChildren' || /context\.(dirtyPaths|stateDirtyNodes)\.(add|delete|has)/.test(name)) return result(B, 'Required dirty-frontier maintenance/post-order consumption under the current documented algorithm. This citation does not prove every particular map/string operation is a lower-bound cost.', [evidence.stable, evidence.dirty]);
  if (owner === 'captureFieldNodeChange' || owner === 'clearFieldNodeChanges') return result(B, 'Record and clear the last-delivered baseline per changed node, preserving previous/current semantics.', [evidence.previous]);
  if (owner.startsWith('FieldNodeRevisionLedger.') || /pendingRevision|revisionNodes/.test(name)) return result(B, 'Per-bit revision advancement is required for the entire committed delivery set, independently of listener delivery. Allocation/layout constants are not claimed irreducible.', [evidence.revision]);
  if (owner === 'markFieldNodeEvent' || owner === 'markCommitDeliveries.mark' || /payload|pendingDelivery/.test(name)) return result(B, 'Record the committed per-node event bits and previous/current payload for later delivery.', [evidence.payload, evidence.previous]);
  if (owner === 'assembleObject' || owner === 'writeObjectKey' || owner === 'preserveReferences' || /node\.behavior\.(assemble|project)/.test(name)) return result(B, 'Assemble/project output while preserving ordered-key and reference semantics. The ledger requires the result; this does not certify each helper invocation as unavoidable.', [evidence.reference, evidence.compute]);
  if (owner === 'markWrite' && /write node\.raw|context\.(writtenInputs|changedRaw|changedNodes)\.(set|add)/.test(name)) return result(B, 'Admit the written value and record the changed source/recalculation frontier.', [evidence.marking]);
  if (owner === 'keepsHostKeys') return result(C, 'Static-host admission scans preserve the optimization eligibility proof; no cited rule requires this exact scan count, and legacy sort/propagation already scans object keys. Absence alone would not prove redundant work.');
  if (owner === 'sameValue' || owner === 'staticSpec') return result(C, 'Aggregates useful and potentially redundant calls. Equality/reference semantics are required, but the exact number of recursive comparisons or cache lookups is not fixed; use the isolated known-child call site for the proved redundancy.', [evidence.reference, evidence.known]);
  if (/watch|Watch|feature|Feature/.test(name)) return result(C, 'The BN scene declares no watchers. Distinguish executed membership guards from actual watcher visits; absence of watchers does not by itself prove this exact guard removable.', [evidence.feature]);
  return result(C, kind === 'loop-iteration' ? 'Loop-body envelope includes nested work and timer overhead; its exact iteration/data-structure cost is not established as a contract lower bound or a proved legacy-absent redundancy.' : 'The trace identifies the operation, but no cited sentence proves this exact implementation cost mandatory or safely absent from the comparable legacy path. It is not counted as removable.');
}

// The review records the five largest previously unclassified labels per hot spot.
export function review(label, group) {
  const { name } = label;
  if (group === 'markWrite') {
    if (name === 'markWrite') return result(C, 'Missing evidence: an overhead-calibrated split of markWrite self time into admission/changed-value guards and timer bookkeeping is needed before its mixed residual can be assigned to required semantics or redundant legacy-absent work.');
    if (name === 'markWrite :: loop @6546 for (const name of Object.keys(node.structure)) ') return result(C, 'Missing evidence: the residual child-loop guards and argument preparation need a legacy-matched split showing which work duplicates an already-established fact, beyond the separately measured unused default lookup.');
    if (name === 'markWrite :: child.behavior.interpret @6552') return result(B, 'One interpretation of each supplied leaf input remains explicitly required by the static same-value write contract; this call site performs that first interpretation, distinct from the unused second spec lookup.', [evidence.interpret, evidence.known]);
    if (name === 'hasDistributedChildInput') return result(C, 'Missing evidence: a contract sentence requiring these repeated array/plain/own-key guards, or a proven reusable host-input fact that makes them redundant while preserving inherited-key and missing-key behavior, has not been established.');
    if (name === 'staticSpec') return result(C, 'Missing evidence: self time for the 1001 consumed spec lookups must be separated from self time for the 1000 unused defaults; the aggregate 2001-call timer cannot establish either class for its whole cost.', [evidence.known]);
    if (label.owner === 'keepsHostKeys') return result(C, 'Missing evidence: a reusable eligibility proof that removes this key scan while preserving the host shape is needed, since DETAIL requires key preservation and legacy object propagation also scans keys.', [evidence.hostKeys]);
  }
  if (group === 'computeStableNode') {
    if (name === 'updateOutput') return result(C, 'Missing evidence: a calibrated split of scalar output guards from inactive append/pop/virtual bookkeeping and timer overhead is needed to classify the updateOutput residual, even though producing local/emit is required.', [evidence.compute]);
    if (name === 'computeStableNode') return result(C, 'Missing evidence: the stable-compute residual needs a timer-overhead baseline separating its required dirty/post-order control from wrapper and branch bookkeeping; the DETAIL sentence alone does not allocate this self time.', [evidence.stable]);
    if (name === 'computeStableNode :: loop @7342 for (let index = 0; index < recalculated.length; index++) computeStableNode(recalculated[index], context);') return result(B, 'This loop consumes the recalculated direct children before the parent output, as explicitly retained by the stable post-order contract; classification does not make its measured loop/timer constant irreducible.', [evidence.stable, evidence.compute]);
    if (name === 'updateOutput :: write node.local @1372' || name === 'updateOutput :: write node.emit @1373') return result(B, 'Store the computed per-node local/emit result after capturing its last-delivered baseline; this implements the required local/emit computation and previous/current payload semantics.', [evidence.compute, evidence.previous]);
    if (name === 'updateOutput :: context.changedNodes.add @1375') return result(B, 'Record the node whose local/emit changed so the commit can construct its required previous/current value delivery.', [evidence.payload, evidence.previous]);
    if (name === 'assembleRaw') return result(B, 'For the 1000 numeric terminals, the assembly body only returns node.raw as the terminal local value, implementing terminal value ownership and per-node output computation without a host copy.', [evidence.terminal, evidence.compute]);
    if (label.owner === 'sameValue') return result(C, 'Missing evidence: per-caller equality self time and a proof identifying already-known comparison results are needed to distinguish required reference preservation from redundant comparisons inside the aggregated sameValue/NaN path.', [evidence.reference]);
    if (name === 'FieldNode.get name' || name === 'FieldNode.get path') return result(C, 'Missing evidence: a legacy-matched count and timer baseline for repeated metadata getter reads are needed to distinguish required node/key addressing from avoidable getter dispatch and measurement overhead.');
  }
  if (group === 'markCommitDeliveries') {
    if (name === 'markCommitDeliveries :: loop @9472 while (true) ') return result(B, 'The two-iterator loop implements the explicitly documented global-state-first candidate union and membership exclusion in insertion order; its 2006 iterations include done probes and overlap skips, not 2006 delivered nodes.', [evidence.commitOrder]);
    if (name === 'commitSettlement:callback@9794:32') return result(B, 'This commit visitor selects changed live nodes, recomputes their misfit, maintains the root path set and records newly-on warnings, implementing the per-changed-node misfit contract; its exact guard/container constants are not asserted irreducible.', [evidence.misfitRecompute, evidence.misfitPath]);
    if (name === 'markCommitDeliveries') return result(C, 'Missing evidence: the commit root residual needs a calibrated split between required candidate/delivery setup and optional-feature/container/timer bookkeeping before the mixed self time can be classified.');
    if (name === 'commitGlobalState.visit') return result(C, 'Missing evidence: a scene-wide proof that interaction-state candidates cannot contribute a true key is needed to skip these empty-state visits, while EVENT-062 specifies counts but does not require inspecting every changed value node.', [evidence.globalCounts, evidence.feature]);
    if (name === 'effectiveType') return result(C, 'Missing evidence: a proof that the static BN eligibility facts permit reusing each current type without revalidating schema.type is needed, since VALUE-037 requires current-type membership but does not specify this helper or its repeated guards.', [evidence.misfit]);
    if (name === 'PathKeyedSet.delete' || name === 'commitSettlement:callback@9794:32 :: runtime.misfitPaths.delete @9802') return result(C, 'Missing evidence: a reusable proof that the misfit path set is empty or this path is absent is needed to elide these successful-type cleanup deletions, since VALUE-037 requires the final path set but not a delete for an already-absent path.', [evidence.misfitPath]);
    if (name === 'isMisfit :: (typeof effective === "string" ? [effective] : effective).some @9148') return result(B, 'The membership test recalculates the required raw-versus-effective-type misfit for each changed numeric leaf; the ledger requires that test result, without fixing the temporary array or some call as an irreducible implementation.', [evidence.misfit, evidence.misfitRecompute]);
  }
  return undefined;
}

export function classify(label, group) {
  return review(label, group) ?? baseClassify(label, group);
}
