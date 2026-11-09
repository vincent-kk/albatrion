import type { Decorator } from '@storybook/react-vite';
import type { FormScenario } from '@aileron/schema-form-scenarios';

import { StoryPanels } from './StoryPanels';

/**
 * Decorate scenario canvases and scope Usage form styling through Storybook titles.
 * @param Story - Storybook-owned renderer; it never subscribes to panel reports.
 * @param context - Storybook title, args, parameters and current canvas/docs view mode.
 * @returns Form-only styling for Usage, a panel owner for scenarios, or the unchanged story.
 */
export const withStoryPanels: Decorator = (Story, context) => {
  if (context.title.startsWith('Usage/')) return <div className="sf-usage"><Story /></div>;
  const parameters = context.parameters.storyPanels;
  if (parameters === false || (!context.args.scenario && !parameters)) return <Story />;
  return <StoryPanels key={context.id} scenario={context.args.scenario as FormScenario | undefined} parameters={parameters} docs={context.viewMode === 'docs'}><Story /></StoryPanels>;
};
