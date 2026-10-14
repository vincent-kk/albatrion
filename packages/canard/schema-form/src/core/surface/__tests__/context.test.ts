import { describe, expect, it } from 'vitest';

import { blueprint } from '@/schema-form/core/engine';
import { PathKeyedMap } from '@/schema-form/core/engine';
import { PathKeyedSet } from '@/schema-form/core/engine';

import { fieldNodeFactory } from '../utils/fieldNodeFactory';
import { setContext } from '../utils/setContext';

// filid:contract surface-members
describe('FieldNode context', () => {
  it('28C-08 context getter delegates the shared runtime reference', () => {
    const initial = { label: 'initial' };
    const root = fieldNodeFactory(
      blueprint({
        type: 'object',
        properties: {
          child: { type: 'string' },
        },
      }),
      {
        context: initial,
        diagnostics: { status: 'stable' },
        loadSnapshot: undefined,
        latentRaw: new PathKeyedMap('pair'),
        typeMismatchPaths: new PathKeyedSet(),
        inactiveValuesMemo: new PathKeyedMap<
          readonly { path: string; value: unknown }[]
        >('path'),
      },
    );
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
