import { toDisplayJSON } from './toDisplayJSON';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show current output and authored defaults from renderer reports.
 * @returns Always-visible readouts; only this panel subscribes to updates.
 */
export function ValuePanel() {
  const { value, defaultValue } = useStoryPanelsSnapshot();
  return <section className="sf-panel">
    <h3>Value</h3>
    <h4>Current value</h4><pre>{toDisplayJSON(value)}</pre>
    <h4>Default value</h4><pre>{toDisplayJSON(defaultValue)}</pre>
  </section>;
}
