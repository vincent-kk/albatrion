import { toDisplayJSON } from './toDisplayJSON';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Display the currently authored schema with a closed disclosure by default.
 * @returns A fieldset and native details element without scenario-play selectors.
 */
export function SchemaPanel() {
  const { stage } = useStoryPanelsSnapshot();
  return <fieldset><legend>Schema</legend><details><summary>Show schema</summary><pre>{toDisplayJSON(stage.schema)}</pre></details></fieldset>;
}
