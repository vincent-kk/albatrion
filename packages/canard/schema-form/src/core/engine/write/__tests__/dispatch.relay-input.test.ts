import { describe, it } from 'vitest';

/** The relay entry is implemented in stage 2; these cases require that binding-only symbol. */
describe('dispatchRelayInput RequestRefresh revisions and relay lifetime', () => {
  it.todo(
    'does not increment RequestRefresh when the committed value equals the relayed value',
  );
  it.todo(
    'increments RequestRefresh when the parent commits a different value',
  );
  it.todo(
    'keeps only the last relay for a node: emitting x then y and committing x refreshes it',
  );
  it.todo(
    'evaluates an updater once at entry and passes its value to the callback',
  );
  it.todo(
    'evaluates an updater against earlier pending writes inside a user batch',
  );
  it.todo(
    'consumes relay records before a commit listener starts a reentrant write',
  );
  it.todo('clears a relay without a commit before the next independent write');
  it.todo(
    'retains a nested relay until the outer user batch commits and then clears it',
  );
  it.todo(
    'clears nested relay records when the outer batch flushes without value writes',
  );
  it.todo(
    'refreshes a relayed node moved by engine insert/remove in the same batch: both relay.path and node.path must match; public whole-array writes do not move nodes',
  );
  it.todo('ignores a relay whose node is detached before commit');
  it.todo('ignores a relay whose node is disposed before commit');
  it.todo(
    'leaves no relay in either runtime when the callback replaces the root',
  );
});
