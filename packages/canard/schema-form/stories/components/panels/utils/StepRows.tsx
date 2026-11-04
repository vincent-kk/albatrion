import { toDisplayJSON } from '../toDisplayJSON';

/**
 * Summarize either shared operations or composite consumer-tail operations.
 * @param props - Pure operation records in their authored order.
 * @returns A table with stable numbered rows and no playable controls.
 */
export function StepRows({ steps }: { steps: readonly object[] }) {
  return <table><thead><tr><th>#</th><th>Action</th><th>Path</th><th>Value</th><th>Expect</th></tr></thead><tbody>
    {steps.map((step, index) => {
      const record = step as Record<string, unknown>;
      const { action, act, path, value, expect, ...rest } = record;
      return <tr key={index}><td>{index + 1}</td><td>{String(action ?? act)}</td><td>{String(path ?? '')}</td>
        <td><pre>{toDisplayJSON('value' in record ? value : rest)}</pre></td><td><pre>{toDisplayJSON(expect)}</pre></td></tr>;
    })}
  </tbody></table>;
}
