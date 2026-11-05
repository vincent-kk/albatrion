import { useStoryPanelsSnapshot } from './useStoryPanelsSnapshot';

/**
 * Subscribe the heading badge without subscribing the Form or its frame.
 * @returns The current error count with a semantic danger or success colour.
 */
export function ErrorsCount() {
  const { errors } = useStoryPanelsSnapshot();
  return <span className={`sf-badge ${errors.length ? 'sf-badge-danger' : 'sf-badge-success'}`}>{errors.length}</span>;
}
