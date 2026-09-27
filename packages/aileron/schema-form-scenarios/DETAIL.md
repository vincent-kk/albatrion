# Schema Form Scenario Contracts

## Requirements

TEST-008, TEST-010, TEST-011, TEST-022, TEST-023, TEST-024, TEST-077, and
LANDING-090 govern this private verification package. Its initial delivery is a
harness skeleton: it establishes data and adapter contracts while engine
scenarios are introduced by their owning implementation stages.

Scenario data is independent of React, a test runner, and any form engine.
Adapters may use runtime-specific dependencies, but the package never imports
`@canard/schema-form`, even for types. This removes the dependency cycle created
when schema-form tests consume the shared scenarios.

The initial union, fill, and narrowing families are empty. Empty execution
succeeds with zero executed steps and is reported as scaffolding, not coverage.

## API Contracts

`FormScenario` describes a name, a structural schema, an optional initial value,
and ordered steps. A step uses one of `setValue`, `clear`, `push`, `remove`,
`update`, `submit`, `reset`, and `batch`, with its action-specific inputs and
optional observable expectations. Shape expectations use JSON Pointer paths;
value and error expectations describe observations after that step settles.

The core runner receives its engine adapter as an argument. It executes steps
in order, awaits the adapter's completion boundary, and delegates assertions to
the injected observer. It does not import or construct schema-form nodes.

`playScenario(scenario, element)` uses the supplied element as its lookup scope.
The rendered wrapper registers its structural handle and screen adapter on its
own root element; render tests may register them directly on their container.
Lookup checks the supplied element first, then its descendants. Missing or
ambiguous registrations fail explicitly. Registration returns a cleanup that
removes only the registration it created.

The screen adapter performs supported leaf input interactions through user
events and locates fields by `data-path`. Steps that cannot be expressed as
screen input use the registered handle, including `batch`, `reset`, `submit`,
`update`, and non-leaf `setValue`. The initial skeleton delegates these actions
to injected adapters rather than guessing widget or engine semantics.

The scenario wrapper receives the form component as an input and binds its
handle to its root DOM registration. Form rendering and handle lifetime remain
owned by the consumer. Scenario execution errors propagate to the caller;
registration and adapter failures never silently skip a step or expectation.

## Acceptance Criteria

### scenario-data — Pure shared descriptions

- Scenario modules have no runtime execution or engine dependency.
- The action vocabulary contains exactly the eight ledger actions.
- Union, fill, and narrowing families exist and initially contain no scenarios.

### scenario-runner — Injected ordered execution

- An empty scenario runs zero actions and succeeds.
- A supplied adapter receives each step once, in order, with completion awaited.
- Expectations are delegated after completion and failures propagate.

### scenario-registration — Scoped DOM handoff

- A registration can be found on the received element or a descendant.
- Cleanup does not remove a newer registration for the same element.
- Missing and ambiguous handles fail explicitly.
- The wrapper can receive a structurally compatible form without an engine import.

### scenario-screen — Shared screen entry point

- The public screen call takes only the scenario and scope element.
- The registered adapter owns user events and handle-only action routing.
- Story and render callers can share the same scenario without duplicating steps.

## Last Updated

2026-09-27
