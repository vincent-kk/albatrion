import { FormatterErrorBoundary } from '../components/FormatterErrorBoundary';
import type { FieldProxyProps } from '../type';

/** React renderer identities own boundary types without retaining discarded renderers. */
const boundaryTypes = new WeakMap<
  NonNullable<FieldProxyProps['FieldRenderer']>,
  typeof FormatterErrorBoundary
>();

/**
 * Reuse the type owned by a selected renderer; React retains instance-local error state.
 * @param renderer - Resolved renderer identity used as the weak cache key
 * @returns Boundary type whose identity changes only with the selected renderer
 */
export const getRendererBoundary = (
  renderer: NonNullable<FieldProxyProps['FieldRenderer']>,
): typeof FormatterErrorBoundary => {
  let boundary = boundaryTypes.get(renderer);
  if (!boundary) {
    boundary = class RendererBoundary extends FormatterErrorBoundary {};
    boundaryTypes.set(renderer, boundary);
  }
  return boundary;
};
