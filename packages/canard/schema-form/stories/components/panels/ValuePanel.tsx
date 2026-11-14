import { useMemo } from 'react';

import { toDisplayJSON } from './toDisplayJSON';
import { Icon } from './utils/Icon';
import { useStoryPanelsSnapshot } from './utils/useStoryPanelsSnapshot';
import { type ValueChange, listValueChanges } from './utils/listValueChanges';

/** Badge text for each difference kind, so the kind never depends on colour alone. */
const CHANGE_LABELS: Readonly<Record<ValueChange['kind'], string>> = { added: 'Added', removed: 'Removed', changed: 'Changed' };

/**
 * Write one difference as compact `before → after` JSON.
 * @param change - A difference from listValueChanges.
 * @returns `→ 1` for an addition, `"x" → absent` for a removal, otherwise both values.
 */
function toChangeText({ kind, before, after }: ValueChange): string {
  if (kind === 'added') return `→ ${toDisplayJSON(after, 0)}`;
  if (kind === 'removed') return `${toDisplayJSON(before, 0)} → absent`;
  return `${toDisplayJSON(before, 0)} → ${toDisplayJSON(after, 0)}`;
}

/**
 * Show the current output and where it differs from the defaultValue prop, from renderer reports.
 * @returns Always-visible readouts; the authored defaults sit in a closed disclosure.
 */
export function ValuePanel() {
  const { value, initialValue, defaultValue } = useStoryPanelsSnapshot();
  const { changes, total } = useMemo(() => listValueChanges(defaultValue, value), [defaultValue, value]);
  const defaultJSON = toDisplayJSON(defaultValue);
  const initialJSON = toDisplayJSON(initialValue);
  return <section className="sf-panel">
    <h3>Value</h3>
    <h4>Current value</h4><pre>{toDisplayJSON(value)}</pre>
    <h4>Compared with defaultValue <span className={`sf-badge ${total ? 'sf-badge-neutral' : 'sf-badge-success'}`}>{total}</span></h4>
    {total
      ? <ul className="sf-changes">{changes.map((change) => <li key={change.path}>
        <span className={`sf-badge sf-change-${change.kind}`}>{CHANGE_LABELS[change.kind]}</span>
        <code>{change.path || '(root)'}</code>
        <span className="sf-change-values">{toChangeText(change)}</span>
      </li>)}</ul>
      : <p className="sf-empty"><Icon name="check" />The current value equals defaultValue.</p>}
    {total > changes.length && <p className="sf-muted">{total - changes.length} more differences are not listed.</p>}
    <details className="sf-subpanel">
      <summary>defaultValue prop</summary>
      <pre>{defaultJSON}</pre>
      {initialJSON !== defaultJSON && <><h4>Scenario initialValue</h4><pre>{initialJSON}</pre></>}
    </details>
  </section>;
}
