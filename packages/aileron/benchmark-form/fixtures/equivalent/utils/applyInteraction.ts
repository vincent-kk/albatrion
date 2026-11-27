import type { BenchHandle, Interaction } from '../types';

/** Applies one authored operation to an existing public Form handle; missing paths fail loudly. */
export function applyInteraction(
  handle: BenchHandle,
  interaction: Interaction,
): void {
  const node = handle.findNode(interaction.path);
  if (!node) throw new Error(`Missing interaction path: ${interaction.path}`);
  if (interaction.kind === 'set') node.setValue(interaction.value);
  else {
    if (node.type !== 'array')
      throw new Error(`Expected array interaction path: ${interaction.path}`);
    if (interaction.kind === 'remove') node.remove(interaction.index);
    else node.push(interaction.value);
  }
}
