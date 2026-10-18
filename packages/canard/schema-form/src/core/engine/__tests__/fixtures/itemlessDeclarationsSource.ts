import * as entries from '../../blueprint';
import * as writes from '../../write';
import { buildFieldNodeTree, mountFieldNode } from '../../../surface';
import { createTestValidator } from '../../../__tests__/fixtures/createTestValidator';
import { assertObservationEqual } from '../../../__tests__/fixtures/itemlessDeclarations/codec';
import { runItemlessScene } from '../../../__tests__/fixtures/itemlessDeclarations/observe';
import type { ItemlessEngine } from '../../../__tests__/fixtures/itemlessDeclarations/observe';
import { makeItemlessScene } from '../../../__tests__/fixtures/itemlessDeclarations/scenes';

/** Actual source bindings; the test view adds record fields without changing runtime behavior. */
export const sourceEngine = {
  ...writes,
  ...entries,
  buildFieldNodeTree,
  mountFieldNode,
} as unknown as ItemlessEngine;

/** Exercise caller/retention assertions and reproducible complete histories on independently compiled forms. */
export function checkSourceScene(id: string): void {
  const first = runItemlessScene(
    sourceEngine,
    makeItemlessScene(id),
    createTestValidator(),
  );
  const second = runItemlessScene(
    sourceEngine,
    makeItemlessScene(id),
    createTestValidator(),
  );
  assertObservationEqual(first, second, id + '/fresh source history');
  if (first.phase !== 'completed') {
    if (
      ![
        'boolean-items-true',
        'boolean-items-false',
        'empty-tuple',
        'additional-boolean-no-items',
        'legacy-tuple-additional',
        'recursive-items',
      ].includes(id)
    )
      throw new Error(
        'Unexpected compile rejection: ' +
          id +
          ' ' +
          JSON.stringify(first.error),
      );
    return;
  }
  if (
    !first.observation?.callerOwnershipChecks ||
    !first.observation.listenerHistory
  )
    throw new Error('Missing real caller/event observations: ' + id);
}
