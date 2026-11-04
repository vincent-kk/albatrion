import { toDisplayJSON } from './toDisplayJSON';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Display the currently authored schema with a closed disclosure by default.
 * @returns A native details element without scenario-play selectors.
 */
export function SchemaPanel() {
  const { stage } = useStoryPanelsSnapshot();
  return <details className="sf-panel"><summary>Schema</summary><pre>{toDisplayJSON(stage.schema)}</pre></details>;
}
