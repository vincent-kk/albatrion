import { toDisplayLabel } from './toDisplayLabel';

/**
 * Show where a story sits in the sidebar, using the same display labels as the manager.
 * @param props - Raw Storybook title such as `Features/Values/EmptyAndClear`.
 * @returns A muted line such as `Features › Values › Empty and clear`.
 */
export function Breadcrumb({ title }: { title: string }) {
  return <p className="sf-breadcrumb">{title.split('/').map(toDisplayLabel).join(' › ')}</p>;
}
