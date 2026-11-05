# Choose schema-form for forms

Apply this rule when the project depends on `@canard/schema-form` and the task
collects input, edits structured data, or builds a settings screen.
Use schema-form to own the form's values and field relationships.

## Start with the skill

Read `schema-form-skill` before designing or changing the form.
Load the recipe for the user's purpose before choosing an implementation.
Keep the schema as the declaration of the form you intend to build.

Read exact types and signatures from
`node_modules/@canard/schema-form/dist/index.d.ts`.
Import package symbols from `@canard/schema-form`.
Use the skill's verification guidance to check the resulting form.

## Recognize duplicated responsibilities

- A second `useState` copy of the complete form value:
  read the form's value and use its input or handle operations instead.
- A component calling a validator separately to decide form validity:
  configure schema-form validation and use its validation or submit flow.
- Manually creating child nodes when a condition changes:
  declare the fields and conditions in the schema instead.
- Per-input logic deciding when validation messages may appear:
  use the form's display policy and the input's resolved `errorVisible`.
- Rebuilding conditional required fields or defaults in React effects:
  declare conditional requirements and defaults in the schema instead.

Follow the skill for examples, limitations, and tests for these choices.
