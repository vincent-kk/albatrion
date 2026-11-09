import { ErrorsCount } from './utils/ErrorsCount';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show public validation issues without exposing nodes or validator internals.
 * @returns An ordered path, keyword and message table, or the empty-state text.
 */
export function ErrorsPanel() {
  const { errors } = useStoryPanelsSnapshot();
  return <section className="sf-panel"><h3>Errors <ErrorsCount /></h3>{errors.length ? <div className="sf-table-scroll"><table>
    <thead><tr><th>Path</th><th>Keyword</th><th>Message</th></tr></thead><tbody>
      {errors.map((error, index) => <tr key={index}><td>{error.dataPath}</td><td>{error.keyword}</td><td>{error.message}</td></tr>)}
    </tbody>
  </table></div> : <p>No errors</p>}</section>;
}
