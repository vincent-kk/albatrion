import { type ReactNode, useState } from 'react';

import type { FormScenario } from '@aileron/schema-form-scenarios';

import { DescriptionPanel } from './DescriptionPanel';
import { ErrorsPanel } from './ErrorsPanel';
import { PlayStepsPanel } from './PlayStepsPanel';
import { SchemaPanel } from './SchemaPanel';
import { SettingsPanel } from './SettingsPanel';
import { StoryPanelsContext } from './StoryPanelsContext';
import { ValuePanel } from './ValuePanel';
import { storyPanelsStore } from './storyPanelsStore';
import type { StoryPanelsParameters } from './types';

/** Props of the panel frame owned by one decorated story. */
interface StoryPanelsProps {
  /** Authored scenario rendered by the child story, when the story has one. */
  scenario?: FormScenario;
  /** Composite metadata that does not travel through Storybook args. */
  parameters?: StoryPanelsParameters;
  /** Raw Storybook title, shown as a breadcrumb. */
  title: string;
  /** Raw story heading before display formatting. */
  heading: string;
  /** Whether the story renders inside a docs page. */
  docs: boolean;
  /** The Storybook-owned story renderer. */
  children: ReactNode;
}

/**
 * Own a store for one React-mounted story without subscribing its child Form.
 * @param props - Authored scenario, optional tail metadata, labels, view mode and Story child.
 * @returns The header, then the Form beside its inspector: Value, Errors, Play steps, Schema, Settings.
 */
export function StoryPanels({ scenario, parameters, title, heading, docs, children }: StoryPanelsProps) {
  const [store] = useState(() => storyPanelsStore({
    value: scenario?.initialValue, initialValue: scenario?.initialValue, defaultValue: scenario?.initialValue, errors: [],
    settings: { mountProps: parameters?.mountProps }, stage: { current: 1, total: 1, schema: scenario?.schema ?? {} },
  }));
  return <StoryPanelsContext.Provider value={store}>
    <div className={`sf-story${docs ? ' sf-story-docs' : ''}`}>
      <DescriptionPanel scenario={scenario} title={title} heading={heading} docs={docs} />
      <div className="sf-story-body">
        <div className="sf-form">{children}</div>
        <aside className="sf-inspector" aria-label="Form inspector">
          <ValuePanel /><ErrorsPanel />
          <PlayStepsPanel scenario={scenario} parameters={parameters} docs={docs} />
          <SchemaPanel /><SettingsPanel />
        </aside>
      </div>
    </div>
  </StoryPanelsContext.Provider>;
}
