import type { BenchHandle, Interaction } from '../types';

/** Applies one authored operation to an existing public Form handle; missing paths fail loudly. */
export function applyInteraction(
  handle: BenchHandle,
  interaction: Interaction,
): void {
  const node = handle.findNode(interaction.path);
  if (!node) throw new Error(`Missing interaction path: ${interaction.path}`);
  if (interaction.kind === 'remove') node.remove(interaction.index);
  else if (interaction.kind === 'push') node.push(interaction.value);
  else node.setValue(interaction.value);
}
