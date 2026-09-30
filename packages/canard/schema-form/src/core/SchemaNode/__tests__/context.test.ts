import { describe, expect, it } from 'vitest';

import { blueprint } from '../../blueprint';
import { schemaNodeFactory, setContext } from '../index';

// filid:contract surface-members
describe('SchemaNode context', () => {
  it('28C-08 context getter delegates the shared runtime reference', () => {
    const initial = { label: 'initial' };
    const root = schemaNodeFactory(blueprint({ type: 'object', properties: {
      child: { type: 'string' },
    } }), { context: initial, ifPredicates: new Map(),
      diagnostics: { status: 'stable' }, loadSnapshot: undefined,
      latentRaw: new Map(), typeMismatchPaths: new Set(),
      inactiveValuesMemo: new Map() });
    root.setValue({ child: 'value' });
    const child = root.find('/child');
    expect(root.context).toBe(initial);
    expect(child?.context).toBe(initial);
    const next = { label: 'next' };
    setContext(root, next);
    expect(root.context).toBe(next);
    expect(child?.context).toBe(next);
  });
});
