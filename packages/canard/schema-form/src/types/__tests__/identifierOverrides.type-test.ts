import type { ChildFieldProps, OverridableFieldInputProps } from '../field/fieldInput';

/** Compile-time proof that presentation cannot override binding-owned identity. */
const checkOverrides = (child: ChildFieldProps, override: OverridableFieldInputProps) => {
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
