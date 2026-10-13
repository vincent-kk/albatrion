import type { Decorator } from '@storybook/react-vite';
import type { FormScenario } from '@aileron/schema-form-scenarios';

import { StoryPanels } from './StoryPanels';

/**
 * Decorate scenario canvases through Storybook's global decorators registration.
 * @param Story - Storybook-owned renderer; it never subscribes to panel reports.
 * @param context - Storybook args, parameters and current canvas/docs view mode.
 * @returns The unchanged story when opted out, otherwise a story-scoped panel owner.
 */
export const withStoryPanels: Decorator = (Story, context) => {
  const parameters = context.parameters.storyPanels;
  if (parameters === false || (!context.args.scenario && !parameters)) return <Story />;
  return <StoryPanels key={context.id} scenario={context.args.scenario as FormScenario | undefined} parameters={parameters} docs={context.viewMode === 'docs'}><Story /></StoryPanels>;
};
