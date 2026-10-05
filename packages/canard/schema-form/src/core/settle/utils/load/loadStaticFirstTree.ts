import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintChildEntry } from '../../../blueprint';
import { publishGlobalStateDeltas } from '../../../record';
import type { SchemaNodeRecord, TypeMismatchRecord } from '../../../record';
import { SetValueOption } from '../../../types/value';
import { createChildNode } from '../compute/createChildNode';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { arrayExtras } from '../write/arrayExtras';
import { nextExtras } from '../write/nextExtras';
import { isPlain } from '../write/isPlain';
import { staticSpec } from '../write/staticSpec';
import { assembleStaticFirstNode } from './assembleStaticFirstNode';
import { commitStaticFirstNode } from './commitStaticFirstNode';
import { getStaticObjectEntries } from './getStaticObjectEntries';
import { isMissingStaticInput } from './isMissingStaticInput';
import { finishStaticFirstLoad } from './finishStaticFirstLoad';
import { readStaticFirstWarning } from './readStaticFirstWarning';

/** DFS frames have one fixed layout and are retained only along the active ancestry. */
interface Frame<Self> {
  node: Self;
  input: unknown;
  automatic: boolean;
  entered: boolean;
  index: number;
  entries: readonly BlueprintChildEntry[];
  required: readonly unknown[];
  order: number;
  children: Self[] | undefined;
}
/** Empty shape/required lists share immutable storage. */
const EMPTY = Object.freeze([]);

/**
 * Fuse first shape, independent fill, assembly and delivery finalization in one DFS.
 * @param root - Root already admitted by the narrow compiler/runtime eligibility proof
 * @param option - Automatic-write flags interpreted exactly as the generic path
 * @returns Nothing; one reserved commit and every occurrence are eager before return
 */
export const loadStaticFirstTree = <Self extends SchemaNodeRecord<Self>>(
  root: Self, option: SetValueOption,
): void => {
  const runtime = root.runtime;
  const commit = (runtime.commitNumber ?? 0) + 1;
  const disable = (option & SetValueOption.DisableAutomaticWrites) !== 0;
  const enable = (option & SetValueOption.EnableAutomaticWrites) !== 0;
  const suppress = disable || !enable && runtime.disableAutomaticWrites === true;
  const deliveries = runtime.deliveries ??= new Set();
  const stack: Frame<Self>[] = [{ node: root, input: undefined, automatic: false,
    entered: false, index: 0, entries: EMPTY, required: EMPTY, order: 0, children: undefined }];
  let deltas: Map<string, number> | undefined;
  let warnings: { order: number; warning: TypeMismatchRecord }[] | undefined;
  let order = 0;
  while (stack.length) {
    const frame = stack[stack.length - 1];
    const node = frame.node;
    if (!frame.entered) {
      frame.entered = true;
      frame.order = order++;
      deliveries.add(node);
      const schema = node.schema.schema;
      const authored = typeof schema === 'object' && schema !== null ? schema : undefined;
      const fallback = authored && hasOwnProperty(authored, 'default') ? authored.default : undefined;
      let input = frame.input;
      if (!suppress && fallback !== undefined &&
        !(node.behavior.type === 'array' && node.behavior.strategy === 'branch' && input !== undefined) &&
        isMissingStaticInput(node.blueprintNode, input)) {
        input = fallback;
        frame.automatic = true;
      }
      const value = node.behavior.interpret(input, staticSpec(node.schemaType, node.nullable));
      frame.input = value;
      if (node.behavior.strategy === 'branch') {
        node.structure = Object.create(null);
        node.children = frame.children = [];
        if (node.behavior.type === 'array') {
          const array = isArray(value);
          node.itemCount = array ? value.length : 0;
          node.raw = array ? undefined : value;
          node.extras = array ? arrayExtras(node, value) : undefined;
          frame.entries = node.behavior.declareChildren(node);
        } else {
          const object = isPlain(value);
          node.raw = object ? undefined : value;
          node.extras = object ? nextExtras(undefined, value,
            getDeclaredChildNames(node.blueprintNode), false) : undefined;
          frame.entries = getStaticObjectEntries(node.blueprintNode);
          frame.required = isArray(authored?.required) ? authored.required : EMPTY;
        }
      } else node.raw = value;
      const state = node.interactionState;
      for (const key in state)
        if (hasOwnProperty(state, key) && state[key]) {
          deltas ??= new Map();
          deltas.set(key, (deltas.get(key) ?? 0) + 1);
        }
    }
    if (frame.index < frame.entries.length) {
      const entry = frame.entries[frame.index++];
      const child = createChildNode(node, entry);
      node.structure![entry.name] = child;
      frame.children!.push(child);
      child.required = frame.required.includes(entry.name);
      const input = frame.input !== null && typeof frame.input === 'object' &&
        hasOwnProperty(frame.input, entry.name) ? Reflect.get(frame.input, entry.name) : undefined;
      stack.push({ node: child, input, automatic: frame.automatic,
        entered: false, index: 0, entries: EMPTY, required: EMPTY, order: 0, children: undefined });
      continue;
    }
    assembleStaticFirstNode(node);
    commitStaticFirstNode(node, frame.automatic);
    const warning = readStaticFirstWarning(node, frame.automatic);
    if (warning) (warnings ??= []).push({ order: frame.order, warning });
    stack.pop();
  }
  runtime.commitNumber = commit;
  if (deltas) publishGlobalStateDeltas(root, deltas);
  finishStaticFirstLoad(root, option, warnings);
};
