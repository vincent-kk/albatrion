import { toDisplayJSON } from './toDisplayJSON';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show the consumer's effective configuration and current prop stage.
 * @returns A read-only key/value table updated independently of the Form; objects print as blocks.
 */
export function SettingsPanel() {
  const { settings, stage } = useStoryPanelsSnapshot();
  return <details className="sf-panel"><summary>Settings</summary><div className="sf-table-scroll"><table><tbody>
    {Object.entries({ ...settings, stage: `${stage.current} of ${stage.total}` }).map(([key, value]) =>
      <tr key={key}><th scope="row"><code>{key}</code></th><td>{value !== null && typeof value === 'object'
        ? <pre>{toDisplayJSON(value)}</pre>
        : <code>{toDisplayJSON(value, 0)}</code>}</td></tr>)}
  </tbody></table></div></details>;
}
