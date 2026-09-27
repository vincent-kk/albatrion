# Schema Form Scenarios

## Purpose

Own reusable form scenario data and the adapters that execute the same scenario
against an injected core or a rendered form. This private workspace supports
schema-form verification without depending on the schema-form package.

## Conventions

- Scenario modules contain pure data; execution belongs to adapters.
- Use structural contracts for schemas, nodes, handles, and injected forms.
- Families name behavior, including union, fill, and narrowing.

## Boundaries

The package owns scenario vocabulary, ordered execution, observable assertions,
DOM handle registration, and the form wrapper. The consumer owns the engine,
form implementation, rendering lifecycle, and assertion runtime.

## Always do

- Keep schema-form imports absent, including type-only imports.
- Resolve registered handles on the received element and its descendants.
- Keep scenario data reusable by core tests, render tests, and Storybook.
- Preserve the single `playScenario(scenario, element)` entry shape.

## Ask first

- Expand the action vocabulary beyond the ledger's eight actions.
- Add a dependency from this package to a form engine implementation.
- Make this private verification package publishable.

## Never do

- Import an engine or a test runner into a scenario data module.
- Duplicate a scenario's schema and steps in each execution layer.
- Claim that an empty family verifies engine behavior.
