import { describe, expect, it, vi } from 'vitest';

import { createReferenceResolver } from '../createReferenceResolver';
import { createReferenceResolverAsync } from '../utils/createReferenceResolverAsync';
import { scan } from './fixtures/scan';

describe('empty same-document references', () => {
  it('resolves an empty reference to the same boolean root as #', () => {
    const resolver = createReferenceResolver(false);
    const context = resolver.root(false);
    expect(resolver.resolve('', '$ref', context)).toEqual({
      status: 'resolved',
      uri: '#',
      target: false,
    });
    expect(resolver.resolve('', '$ref', context)).toEqual(
      resolver.resolve('#', '$ref', context),
    );
    expect(resolver.resolve('other.json', '$ref', context)).toEqual({
      status: 'skipped',
      reason: 'unresolved',
    });
  });

  it('preserves an empty self-reference as a cycle under strict resolution', () => {
    const schema = { $ref: '' };
    const { output, outcomes } = scan(schema, { unresolvedReference: 'throw' });
    expect(output).toEqual(schema);
    expect(outcomes.get('#')).toContainEqual(
      expect.objectContaining({ uri: '#', skipped: 'cycle' }),
    );
  });

  it.each(['urn:example:root', 'tag:example.com,2024:root'])(
    'resolves an empty reference like # under the opaque base %s',
    (id) => {
      const schema = { $id: id, $ref: '' };
      const resolver = createReferenceResolver(schema);
      const context = resolver.root(schema);
      expect(resolver.resolve('', '$ref', context)).toEqual(
        resolver.resolve('#', '$ref', context),
      );
      const empty = scan(schema, { unresolvedReference: 'throw' });
      const hash = scan(
        { $id: id, $ref: '#' },
        { unresolvedReference: 'throw' },
      );
      expect(empty.outcomes.get('#')).toEqual(
        hash.outcomes
          .get('#')!
          .map((outcome) => ({ ...outcome, reference: '' })),
      );
    },
  );

  it('resolves an empty asynchronous reference without loading a document', async () => {
    const load = vi.fn();
    const resolver = createReferenceResolverAsync(false, { load });
    expect(await resolver.resolve('', '$ref', resolver.root(false))).toEqual({
      status: 'resolved',
      uri: '#',
      target: false,
    });
    expect(load).not.toHaveBeenCalled();
  });
});
