import type {
  ChildFieldProps,
  FieldInputProps,
  OverridableFieldInputProps,
  UnknownFieldInputProps,
} from '../field/fieldInput';
import type { SchemaPresentation } from '../schema/jsonSchema';

/** Compile-time proof that presentation cannot override binding-owned identity. */
const checkOverrides = (
  child: ChildFieldProps,
  override: OverridableFieldInputProps,
) => {
  // @ts-expect-error Binding identity is not a presentation override.
  child.inputId = 'replacement';
  // @ts-expect-error Binding title is not a presentation override.
  override.labelId = 'replacement';
  // @ts-expect-error The removed id prop cannot be set on a child field.
  child.id = 'legacy';
  // @ts-expect-error The removed id prop cannot be set on an overridable prop.
  override.id = 'legacy';
  // @ts-expect-error A keyed control requires a key.
  override.getInputId();
  return [child, override];
};
void checkOverrides;

/** The input may connect its own DOM ref or imperative handle. */
const checkFocusRef = (
  input: FieldInputProps,
  unknown: UnknownFieldInputProps,
  child: ChildFieldProps,
  override: OverridableFieldInputProps,
  schema: NonNullable<SchemaPresentation['FieldInputProps']>,
) => {
  const ref: ((element: HTMLInputElement | null) => void) | undefined =
    input.focusRef;
  unknown.focusRef?.({ focus() {} });
  // @ts-expect-error A focus handle must provide focus().
  input.focusRef?.({});
  // @ts-expect-error Child overrides cannot replace the ref.
  child.focusRef = ref;
  // @ts-expect-error Layout overrides cannot replace the ref.
  override.focusRef = ref;
  // @ts-expect-error Schema presentation cannot replace the ref.
  schema.focusRef = ref;
};
void checkFocusRef;
