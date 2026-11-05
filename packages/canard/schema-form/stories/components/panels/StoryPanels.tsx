import { type ReactNode, useState } from 'react';

import type { FormScenario } from '@aileron/schema-form-scenarios';

import { DescriptionPanel } from './DescriptionPanel';
import { ErrorsPanel } from './ErrorsPanel';
import { SchemaPanel } from './SchemaPanel';
import { SettingsPanel } from './SettingsPanel';
import { StepsTable } from './StepsTable';
import { StoryPanelsContext } from './StoryPanelsContext';
import { ValuePanel } from './ValuePanel';
import { storyPanelsStore } from './storyPanelsStore';
import type { StoryPanelsParameters } from './types';

/**
 * Own a store for one React-mounted story without subscribing its child Form.
 * @param props - Authored scenario, optional tail metadata, view mode and Story child.
 * @returns Panels in reading order with Form and live readouts beside one another.
 */
export function StoryPanels({ scenario, parameters, docs, children }: { scenario?: FormScenario; parameters?: StoryPanelsParameters; docs: boolean; children: ReactNode }) {
  const [store] = useState(() => storyPanelsStore({
    value: scenario?.initialValue, defaultValue: { initialValue: scenario?.initialValue }, errors: [],
    settings: { mountProps: parameters?.mountProps }, stage: { current: 1, total: 1, schema: scenario?.schema ?? {} },
  }));
  return <StoryPanelsContext.Provider value={store}>
    <div className={`sf-story${docs ? ' sf-story-docs' : ''}`}>
      <DescriptionPanel scenario={scenario} />
      <div className="sf-story-body">
        <div className="sf-form">{children}</div>
        <aside className="sf-inspector" aria-label="Form inspector">
          <ValuePanel /><ErrorsPanel /><SchemaPanel /><SettingsPanel />
          <StepsTable scenario={scenario} parameters={parameters} />
        </aside>
      </div>
    </div>
  </StoryPanelsContext.Provider>;
}
