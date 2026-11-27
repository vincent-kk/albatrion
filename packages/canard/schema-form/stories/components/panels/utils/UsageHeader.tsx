import { Breadcrumb } from './Breadcrumb';
import { InlineText } from './InlineText';
import { toDisplayLabel } from './toDisplayLabel';

/**
 * Title a Usage canvas, which has no scenario panels, with its place and its story description.
 * @param props - Raw Storybook title and story name, and the story's docs description when it is a string.
 * @returns A header with breadcrumb, heading and the description with backtick spans as code.
 */
export function UsageHeader({ title, name, description }: { title: string; name: string; description?: unknown }) {
  return <header className="sf-story-header">
    <Breadcrumb title={title} />
    <h2>{toDisplayLabel(name)}</h2>
    {typeof description === 'string' && description && <p className="sf-description"><InlineText text={description} /></p>}
  </header>;
}
