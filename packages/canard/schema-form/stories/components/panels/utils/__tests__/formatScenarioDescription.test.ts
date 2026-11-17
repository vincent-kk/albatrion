import { describe, expect, it } from 'vitest';

import {
  compositeCases,
  compositionFeatureScenarios,
} from '@aileron/schema-form-scenarios';

import { formatScenarioDescription } from '../formatScenarioDescription';

describe('formatScenarioDescription', () => {
  it('turns the authored if-then-else contract clauses into readable sentences', () => {
    const scenario = compositionFeatureScenarios.find(
      ({ name }) => name === 'composition.if-then-else-guard',
    )!;
    const description = scenario.description!;
    expect(formatScenarioDescription(description)).toBe(
      'If gates use compileGuard. Then and else are gated declarations. The form does not interpret if. Retains inactive source values.',
    );
    expect(scenario.description).toBe(description);
  });
  it('cleans round markers throughout the real cx15 description', () => {
    const description = compositeCases.find(
      ({ scenario }) =>
        scenario.name === 'composite.cx15-external-and-validation-errors',
    )!.scenario.description!;
    expect(formatScenarioDescription(description)).toBe(
      'A node lists external errors before validator issues. Fixing the value drops only the validator issue. An empty errors prop drops the external one. A non-array errors prop is read as an empty list. getErrors() is the root external errors followed by the validation list. The shared steps check the validator side. The tail stages the errors prop.',
    );
  });
  it('removes repeated IDs, empty parentheses and the prefix colon anywhere', () => {
    expect(
      formatScenarioDescription(
        'TEST-018 NODE-051: clear  leaves (79C-01); after FRAGMENT-009 updates (178C-01), retain values',
      ),
    ).toBe('Clear leaves. After updates, retain values.');
  });
  it('preserves meaningful parentheses and domain values', () => {
    expect(
      formatScenarioDescription(
        'set VAT-0 (default); keep getErrors() and a@b.co. (GOAL-061 T-3)',
      ),
    ).toBe('Set VAT-0 (default). Keep getErrors() and a@b.co.');
  });
  it('collapses whitespace and keeps terminal punctuation', () => {
    expect(
      formatScenarioDescription('  first clause ;  second clause!  '),
    ).toBe('First clause. Second clause!');
    expect(formatScenarioDescription('TEST-018 (79C-01)')).toBe('');
  });
  it('cleans marker lists next to punctuation and preserves meaningful parentheses', () => {
    expect(
      formatScenarioDescription(
        'NODE-051 : first;(TEST-018,79C-01); last (see NODE-051)',
      ),
    ).toBe('First. Last.');
  });

  it('preserves a leading code identifier with parentheses, dots or internal capitals', () => {
    expect(
      formatScenarioDescription(
        'getErrors() returns issues; node.value is current; errorVisibility controls visibility; getErrors returns issues',
      ),
    ).toBe(
      'getErrors() returns issues. node.value is current. errorVisibility controls visibility. getErrors returns issues.',
    );
    expect(
      formatScenarioDescription(
        'submit() sends values; regular prose becomes a sentence',
      ),
    ).toBe('submit() sends values. Regular prose becomes a sentence.');
    expect(formatScenarioDescription('plain.')).toBe('Plain.');
  });
});

describe('reviewed scenario descriptions', () => {
  it('cleans the real validation-state.interaction-state', () => {
    expect(
      formatScenarioDescription(
        'VALUE-022 edited and touched; EVENT-062, LANDING-152 and LANDING-153 globalState keys are true and drop when no node holds them, and the globalState object is replaced only when a key crosses zero; GOAL-061 touched waits for blur; EVENT-067 onStateChange fires once per entry that changes any node state, even when the global keys do not cross zero, so focus leaving /done notifies although globalState is unchanged. Stages come from interactionStateStages.',
      ),
    ).toBe(
      'Edited and touched. globalState keys are true and drop when no node holds them, and the globalState object is replaced only when a key crosses zero. Touched waits for blur. onStateChange fires once per entry that changes any node state, even when the global keys do not cross zero, so focus leaving /done notifies although globalState is unchanged. Stages come from interactionStateStages.',
    );
  });

  it('cleans the real composite.cx01-order-form', () => {
    expect(
      formatScenarioDescription(
        'C1 order form (G3, G2, G4, G5). FRAGMENT-006 the discriminator gates card and bank; controls.derived keeps each row subtotal; the array lives outside the union, so a branch switch keeps rows and subtotals; NODE-051 remove(0) shifts the second row into place as the same node; VALIDATE-043 issues of the inactive branch stay off nodes, so submit is rejected only for the bank account, and succeeds once it is filled.',
      ),
    ).toBe(
      'C1 order form (G3, G2, G4, G5). The discriminator gates card and bank. controls.derived keeps each row subtotal. The array lives outside the union, so a branch switch keeps rows and subtotals. remove(0) shifts the second row into place as the same node. Issues of the inactive branch stay off nodes, so submit is rejected only for the bank account, and succeeds once it is filled.',
    );
  });

  it('cleans the real composite.cx04-amount-input', () => {
    expect(
      formatScenarioDescription(
        'C4 amount input (G6, G5; browser parts in the story). The amount is required with minimum 1: clearing it reports required, writing 0 reports minimum, writing 1234 clears both. The story types into /price through a thousands-separator input (EVENT-003 caret recovery belongs to that input), types "1" then inserts "e" into the native number input so the draft becomes badInput and the node keeps 1 (REACT-027), and submits with Enter; the tail checks the rejected and the resolved submit.',
      ),
    ).toBe(
      'C4 amount input (G6, G5; browser parts in the story). The amount is required with minimum 1: clearing it reports required, writing 0 reports minimum, writing 1234 clears both. The story types into /price through a thousands-separator input (caret recovery belongs to that input), types "1" then inserts "e" into the native number input so the draft becomes badInput and the node keeps 1, and submits with Enter. The tail checks the rejected and the resolved submit.',
    );
  });

  it('cleans the real composite.cx08-switch-with-array-verbs', () => {
    expect(
      formatScenarioDescription(
        'Array push and remove around branch switches: rows pushed before a switch are retained while the branch is closed (LANDING-018) and all four return with it; the batched push-and-switch variant runs apart as composite.batch-push-into-closing-branch; remove shifts identity (NODE-051); rapid round trips in one batch end where they started. Then 197C-01: R2 a virtual write beside another write in one batch reaches its fields, and the tail runs R1, other-kind re-entry inside a batch after a Merge write.',
      ),
    ).toBe(
      'Array push and remove around branch switches: rows pushed before a switch are retained while the branch is closed and all four return with it. The batched push-and-switch variant runs apart as composite.batch-push-into-closing-branch. Remove shifts identity. Rapid round trips in one batch end where they started. Then a virtual write beside another write in one batch reaches its fields, and the tail runs other-kind re-entry inside a batch after a Merge write.',
    );
  });

  it('cleans the real input-components.file-attach', () => {
    expect(
      formatScenarioDescription(
        'onFileAttach stores files by node path in the attached files map, wrapping one file in a list; an input that unmounts (here through active false, LANDING-148) removes its entry, and reset clears the map (TEST-020, TEST-023). Stages come from fileAttachStages.',
      ),
    ).toBe(
      'onFileAttach stores files by node path in the attached files map, wrapping one file in a list. An input that unmounts (here through active false) removes its entry, and reset clears the map. Stages come from fileAttachStages.',
    );
  });

  it('cleans the real exit.presence-readers', () => {
    expect(
      formatScenarioDescription(
        'SETTLE-020·045, CONTROLS-080: emitted presence re-evaluates sibling readers',
      ),
    ).toBe('Emitted presence re-evaluates sibling readers.');
  });

  it('cleans the real composition.discriminator-tag-switch', () => {
    expect(
      formatScenarioDescription(
        'FRAGMENT-006 explicit discriminator gates; FRAGMENT-048 hoisted tag node; LANDING-011 no refill; VALIDATE-043 (6) unmatched tag errors on the tag node.',
      ),
    ).toBe(
      'Explicit discriminator gates. Hoisted tag node. No refill. Unmatched tag errors on the tag node.',
    );
  });
});
