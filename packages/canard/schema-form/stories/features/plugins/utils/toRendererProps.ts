import type { RendererSlot } from '@aileron/schema-form-scenarios';

import type { MarkedRenderers } from './createMarkedRenderers';

/** Renderer props a Form or FormProvider accepts, keyed by their prop names. */
export interface RendererProps {
  /** Group renderer for every node. */
  FieldRenderer?: MarkedRenderers['group'];
  /** Label renderer inside the default group. */
  LabelRenderer?: MarkedRenderers['label'];
  /** Error renderer inside the default group. */
  ErrorMessageRenderer?: MarkedRenderers['error'];
}

/**
 * Pick the renderer props for the slots a case sets.
 * @param slots - Slots to set.
 * @param renderers - Marked renderers of one source.
 * @returns Props with only the chosen slots.
 */
export const toRendererProps = (slots: readonly RendererSlot[], renderers: MarkedRenderers): RendererProps => ({
  ...(slots.includes('group') && { FieldRenderer: renderers.group }),
  ...(slots.includes('label') && { LabelRenderer: renderers.label }),
  ...(slots.includes('error') && { ErrorMessageRenderer: renderers.error }),
});
