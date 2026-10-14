import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';

/**
 * Show public validation issues without exposing nodes or validator internals.
 * @returns An ordered path, keyword and message table, or the empty-state text.
 */
export function ErrorsPanel() {
  const { errors } = useStoryPanelsSnapshot();
  return <fieldset><legend>Errors</legend>{errors.length ? <table>
    <thead><tr><th>Path</th><th>Keyword</th><th>Message</th></tr></thead><tbody>
      {errors.map((error, index) => <tr key={index}><td>{error.dataPath}</td><td>{error.keyword}</td><td>{error.message}</td></tr>)}
    </tbody>
  </table> : <p>No errors</p>}</fieldset>;
}
