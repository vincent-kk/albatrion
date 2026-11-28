import type { BlueprintGate } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { isOwnActiveGate } from '../isOwnActiveGate';
import { readAdmittingEntry } from './readAdmittingEntry';

/** A live host frame; its current path is an address, the object is its lifetime. */
export interface HostFrame {
  /** Current absolute address of the frame. */
  readonly path: string;
}

/** Transported host frames of one live node, keyed by the template's inherited gate objects. */
type FrameBindings = ReadonlyMap<BlueprintGate, HostFrame>;

/** A frame whose template declarations carry no inherited gate allocates nothing. */
const NO_BINDINGS: FrameBindings = new Map();

/** One environment per live node; ancestry, and therefore every bound host, is fixed for its lifetime. */
const FRAMES = new WeakMap<object, FrameBindings>();

/**
 * Read the host frames that the admitting edge transported into a live node.
 * Template declarations and edge declarations align by declaration id and gate position:
 * the edge carries the referring host's copy of each inherited condition at the same index.
 * @param node - Live occurrence of a shared template
 * @returns Host frame for every inherited gate on the template's declarations; template-local
 * gates are absent because their host is the node itself
 * @throws When the admitting edge does not carry an inherited gate at the aligned declaration id
 * and position (missing transport, an internal invariant failure)
 */
export const readFrameBindings = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): FrameBindings => {
  const cached = FRAMES.get(node);
  if (cached) return cached;
  const parent = node.__parent__;
  const template = node.blueprintNode;
  let bindings: Map<BlueprintGate, HostFrame> | undefined;
  if (parent) {
    let entry: ReturnType<typeof readAdmittingEntry> | undefined;
    for (let index = 0; index < template.declarations.length; index++) {
      const declaration = template.declarations[index];
      for (let position = 0; position < declaration.gates.length; position++) {
        const gate = declaration.gates[position];
        if (gate.hostPath === template.path || bindings?.has(gate)) continue;
        entry ??= readAdmittingEntry(parent, node);
        const applied = entry.declarations[index];
        const carried = applied?.gates[position];
        if (
          applied?.id !== declaration.id ||
          !isSameCondition(carried, gate)
        )
          throw new Error(
            `Missing gate transport for ${gate.schemaPath} at ${node.path}`,
          );
        (bindings ??= new Map()).set(
          gate,
          isOwnActiveGate(carried.schemaPath, applied.schemaPath) ||
            carried.hostPath === applied.path
            ? node
            : readOwnerFrame(parent, carried),
        );
      }
    }
  }
  FRAMES.set(node, bindings ?? NO_BINDINGS);
  return bindings ?? NO_BINDINGS;
};

/**
 * Bind a gate in its owner's frame: local to the owner's template or transported into it.
 * A condition introduced at a direct edge's target is a child-frame binding that the caller
 * names with the edge (`bindGateFrame`), so it never reaches this reader.
 * @param owner - Live owner reading the gate on its own or its edges' declarations
 * @param gate - Gate reference held by the owner's template or one of its direct edges
 * @returns The owner or the owner's transported host frame
 * @throws When no edge transported the gate (missing transport, an internal invariant failure)
 */
export const readOwnerFrame = <Self extends FieldNodeRecord<Self>>(
  owner: Self,
  gate: BlueprintGate,
): HostFrame => {
  if (gate.hostPath === owner.blueprintNode.path) return owner;
  const host = readFrameBindings(owner).get(gate);
  if (host) return host;
  // A virtual group's edges are copies of its host's constituent edges.
  if (owner.behavior.type === 'virtual' && owner.__parent__)
    return readOwnerFrame(owner.__parent__, gate);
  throw new Error(
    `Missing gate transport for ${gate.schemaPath} at ${owner.path}`,
  );
};

/** Whether a carried gate is the same authored condition as a template gate. */
const isSameCondition = (
  carried: BlueprintGate | undefined,
  gate: BlueprintGate,
): carried is BlueprintGate =>
  carried !== undefined &&
  carried.kind === gate.kind &&
  carried.schemaPath === gate.schemaPath &&
  !!carried.isNegated === !!gate.isNegated;
