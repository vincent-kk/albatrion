import { toDisplayJSON } from './toDisplayJSON';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show current output and authored defaults from renderer reports.
 * @returns Two adjacent read-only fieldsets; only this panel subscribes to updates.
 */
export function ValuePanel() {
  const { value, defaultValue } = useStoryPanelsSnapshot();
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
    <fieldset style={{ flex: 1, minWidth: 0 }}><legend>Current value</legend><pre>{toDisplayJSON(value)}</pre></fieldset>
    <fieldset style={{ flex: 1, minWidth: 0 }}><legend>Default value</legend><pre>{toDisplayJSON(defaultValue)}</pre></fieldset>
  </div>;
}
