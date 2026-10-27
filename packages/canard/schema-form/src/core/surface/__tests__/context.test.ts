import { describe, expect, it } from 'vitest';

import { blueprint } from '@/schema-form/core/engine';
import { PathKeyedMap } from '@/schema-form/core/engine';
import { PathKeyedSet } from '@/schema-form/core/engine';

import { setContext } from '../runtime/setContext';
import { fieldNodeFactory } from '../utils/fieldNodeFactory';

// filid:contract surface-members
describe('FieldNode context', () => {
  it('28C-08 context getter delegates the shared runtime reference', () => {
    // These assertions inspect the latent-store baseline directly.
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
        literalStarRaw: new PathKeyedMap('pair'),
        misfitPaths: new PathKeyedSet(),
        literalStarValuesMemo: new PathKeyedMap<
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
