import { dispatchRelayInput } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode, SetValueOption } from '../../type';

/**
 * Relay an overridden input callback through the binding-only engine channel.
 * @param node - Public input occurrence
 * @param input - Value or call-site updater
 * @param option - Replacement, merge, and automatic-write flags
 * @param relay - Callback receiving the evaluated input value
 * @returns Nothing; the dispatcher completes the synchronous batch
 */
export const relayFieldNodeInput = (
  node: FieldNode,
  input: unknown,
  option: SetValueOption,
  relay: (input: unknown, option: SetValueOption) => void,
): void =>
  dispatchRelayInput(requireRuntimeFieldNode(node), input, option, relay);
