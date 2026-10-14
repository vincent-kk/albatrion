import { toDisplayJSON } from './toDisplayJSON';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show the consumer's effective configuration and current prop stage.
 * @returns A read-only key/value table updated independently of the Form.
 */
export function SettingsPanel() {
  const { settings, stage } = useStoryPanelsSnapshot();
  return <fieldset><legend>Settings</legend><table><tbody>
    {Object.entries({ ...settings, stage: `${stage.current}/${stage.total}` }).map(([key, value]) =>
      <tr key={key}><th scope="row">{key}</th><td><pre>{toDisplayJSON(value)}</pre></td></tr>)}
  </tbody></table></fieldset>;
}
