import type { Decorator } from '@storybook/react-vite';
import type { FormScenario } from '@aileron/schema-form-scenarios';

import { StoryPanels } from './StoryPanels';
import { UsageHeader } from './utils/UsageHeader';

/**
 * Decorate scenario canvases and title Usage canvases, scoping form styling through Storybook titles.
 * Composite files export one story named `Case`, so their heading is the component title segment.
 * @param Story - Storybook-owned renderer; it never subscribes to panel reports.
 * @param context - Storybook title, name, args, parameters and current canvas/docs view mode.
 * @returns A titled Usage frame, a panel owner for scenarios, or the unchanged story.
 */
export const withStoryPanels: Decorator = (Story, context) => {
  const docs = context.viewMode === 'docs';
  if (context.title.startsWith('Usage/')) return <div className="sf-usage">
    {!docs && <UsageHeader title={context.title} name={context.name} description={context.parameters.docs?.description?.story} />}
    <Story />
  </div>;
  const parameters = context.parameters.storyPanels;
  if (parameters === false || (!context.args.scenario && !parameters)) return <Story />;
  const heading = context.name === 'Case' ? context.title.slice(context.title.lastIndexOf('/') + 1) : context.name;
  return <StoryPanels key={context.id} scenario={context.args.scenario as FormScenario | undefined} parameters={parameters} title={context.title} heading={heading} docs={docs}><Story /></StoryPanels>;
};
