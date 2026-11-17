import { ErrorsCount } from './utils/ErrorsCount';
import { Icon } from './utils/Icon';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show public validation issues without exposing nodes or validator internals.
 * @returns An ordered path, keyword and message table, or an empty state that says the value passes.
 */
export function ErrorsPanel() {
  const { errors } = useStoryPanelsSnapshot();
  return <section className="sf-panel"><h3>Errors <ErrorsCount /></h3>{errors.length ? <div className="sf-table-scroll"><table>
    <thead><tr><th scope="col">Path</th><th scope="col">Keyword</th><th scope="col">Message</th></tr></thead><tbody>
      {errors.map((error, index) => <tr key={index}>
        <td>{error.dataPath ? <code>{error.dataPath}</code> : <span className="sf-muted">(root)</span>}</td>
        <td>{error.keyword && <code>{error.keyword}</code>}</td>
        <td>{error.message}</td>
      </tr>)}
    </tbody>
  </table></div> : <p className="sf-empty"><Icon name="check" />No validation errors for the current value.</p>}</section>;
}
